#!/usr/bin/env python3
"""Extract market data from PostgreSQL → static JSON for Chloe's Market Daily v2."""
import json, os, sys
from datetime import datetime, date, timedelta
from decimal import Decimal
import math
import psycopg2
from dotenv import load_dotenv
import yfinance as yf

load_dotenv('/Users/home_mac_mini/.openclaw/workspace/kospi200_etl/.env')

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
os.makedirs(OUT_DIR, exist_ok=True)

def get_conn():
    return psycopg2.connect(
        host=os.getenv('PGHOST'), port=os.getenv('PGPORT'),
        dbname=os.getenv('PGDATABASE'), user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD')
    )

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            f = float(o)
            return None if (math.isnan(f) or math.isinf(f)) else f
        if isinstance(o, (date, datetime)):
            return o.isoformat()
        if isinstance(o, float) and (math.isnan(o) or math.isinf(o)):
            return None
        return super().default(o)

def _sanitize(obj):
    """Replace NaN/Infinity with None recursively."""
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_sanitize(v) for v in obj]
    return obj

def save(name, data):
    data = _sanitize(data)
    path = os.path.join(OUT_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, cls=DecimalEncoder, ensure_ascii=False)
    print(f"  ✅ {name} ({os.path.getsize(path):,} bytes)")

def get_latest_trade_date(cur):
    cur.execute("SELECT MAX(trade_date) FROM market.daily_bars")
    return cur.fetchone()[0]

def get_trade_dates(cur, n=60):
    cur.execute(f"SELECT DISTINCT trade_date FROM market.daily_bars ORDER BY trade_date DESC LIMIT {n}")
    return sorted([r[0] for r in cur.fetchall()])

# ─── META ───
def extract_meta(cur, latest):
    save('meta.json', {
        'dataDate': latest.isoformat(),
        'buildTime': datetime.now().isoformat(),
    })

# ─── INDEX CHART DATA (real index via yfinance) ───
def extract_index(cur, universe, latest, trade_dates):
    """Fetch real KOSPI/KOSDAQ index data from Yahoo Finance."""
    yahoo_ticker = '^KS11' if universe == 'KOSPI' else '^KQ11'
    
    # Fetch ~4 months to ensure 60 trading days
    start_date = (latest - timedelta(days=120)).isoformat()
    end_date = (latest + timedelta(days=1)).isoformat()
    
    print(f"  Fetching {yahoo_ticker} from Yahoo Finance ({start_date} ~ {end_date})...")
    df = yf.download(yahoo_ticker, start=start_date, end=end_date, progress=False)
    
    if df.empty:
        print(f"  ⚠️ No data from Yahoo Finance for {universe}, skipping")
        return
    
    # Flatten MultiIndex columns if present
    if hasattr(df.columns, 'levels') and df.columns.nlevels > 1:
        df.columns = df.columns.get_level_values(0)
    
    # Filter out rows where OHLC are all 0 (incomplete data)
    df = df[(df['Open'] > 0) & (df['High'] > 0) & (df['Low'] > 0) & (df['Close'] > 0)]
    
    # Take last 60 trading days
    df = df.tail(60)
    
    # Collect raw volumes first, then normalize to 0-1 scale
    raw_rows = []
    for idx, row in df.iterrows():
        td = idx.date() if hasattr(idx, 'date') else idx
        raw_rows.append((td, row))
    
    raw_volumes = sorted([float(r[1]['Volume']) for r in raw_rows if r[1]['Volume'] > 0])
    # Use 90th percentile as reference to avoid outlier distortion
    max_vol = raw_volumes[int(len(raw_volumes) * 0.9)] if raw_volumes else 1
    max_vol = max(max_vol, 1)
    
    candles = []
    for td, row in raw_rows:
        vol = float(row['Volume'])
        candles.append({
            'd': td.strftime('%m%d'),
            'date': td.isoformat(),
            'o': round(float(row['Open']), 2),
            'h': round(float(row['High']), 2),
            'l': round(float(row['Low']), 2),
            'c': round(float(row['Close']), 2),
            'v': round(min(vol / max_vol, 3.0), 1) if vol > 0 else None,
        })
    
    # Compute MA20 / MA60
    closes = [c['c'] for c in candles]
    ma20 = []
    ma60 = []
    for i in range(len(closes)):
        ma20.append(round(sum(closes[max(0,i-19):i+1]) / min(20, i+1), 2))
        ma60.append(round(sum(closes[max(0,i-59):i+1]) / min(60, i+1), 2))
    
    fname = f"index-{'kospi' if universe == 'KOSPI' else 'kosdaq'}.json"
    save(fname, {'candles': candles, 'ma20': ma20, 'ma60': ma60})

# ─── MARKET SUMMARY (Level 1) ───
def extract_market_summary(cur, latest, trade_dates):
    recent_7 = trade_dates[-7:]
    
    # 상승/하락/보합 for latest + sparkline
    summary_spark = []
    for td in recent_7:
        cur.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE b.close > prev.close) as up,
                COUNT(*) FILTER (WHERE b.close < prev.close) as down,
                COUNT(*) FILTER (WHERE b.close = prev.close) as flat,
                SUM(b.close * b.volume) / 1e12 as trading_value
            FROM market.daily_bars b
            JOIN LATERAL (
                SELECT close FROM market.daily_bars p 
                WHERE p.ticker = b.ticker AND p.trade_date < %s 
                ORDER BY p.trade_date DESC LIMIT 1
            ) prev ON true
            WHERE b.trade_date = %s AND b.volume > 0 AND b.volume IS NOT NULL
        """, (td, td))
        row = cur.fetchone()
        if row:
            up, down, flat = int(row[0] or 0), int(row[1] or 0), int(row[2] or 0)
            tv = round(float(row[3] or 0), 1)
            adr = round(up / max(down, 1), 2)
            summary_spark.append({
                'date': td.isoformat(),
                'up': up, 'down': down, 'flat': flat,
                'adr': adr, 'tradingValue': tv,
            })
    
    latest_data = summary_spark[-1] if summary_spark else {}
    
    # 20일 평균 거래대금
    cur.execute("""
        SELECT AVG(daily_tv) FROM (
            SELECT trade_date, SUM(close * volume) / 1e12 as daily_tv
            FROM market.daily_bars 
            WHERE trade_date >= %s - interval '40 days' AND volume > 0
            GROUP BY trade_date ORDER BY trade_date DESC LIMIT 20
        ) sub
    """, (latest,))
    avg_tv_20 = float(cur.fetchone()[0] or 0)
    tv_ratio = round(latest_data.get('tradingValue', 0) / max(avg_tv_20, 0.01), 2)
    
    # Signal logic
    adr = latest_data.get('adr', 1.0)
    adr_signal = 'green' if adr >= 1.2 else ('red' if adr < 0.8 else 'yellow')
    tv_signal = 'green' if tv_ratio >= 1.2 else ('red' if tv_ratio < 0.8 else 'yellow')
    
    save('market-summary.json', {
        'date': latest.isoformat(),
        'latest': latest_data,
        'sparkline': summary_spark,
        'tradingValueAvg20d': round(avg_tv_20, 1),
        'tradingValueRatio': tv_ratio,
        'signals': {
            'adr': adr_signal,
            'tradingValue': tv_signal,
        }
    })

# ─── BREADTH (Level 2) ───
def extract_breadth(cur, latest, trade_dates):
    recent_30 = trade_dates[-30:]
    
    breadth_data = []
    for td in recent_30:
        # 20일선 위 종목 비율
        cur.execute("""
            WITH stock_ma AS (
                SELECT b.ticker, b.close,
                    AVG(b2.close) as ma20
                FROM market.daily_bars b
                JOIN market.daily_bars b2 ON b2.ticker = b.ticker 
                    AND b2.trade_date <= %s 
                    AND b2.trade_date > %s - interval '30 days'
                WHERE b.trade_date = %s AND b.volume > 0
                GROUP BY b.ticker, b.close
                HAVING COUNT(b2.*) >= 15
            )
            SELECT 
                COUNT(*) FILTER (WHERE close > ma20) as above,
                COUNT(*) as total
            FROM stock_ma
        """, (td, td, td))
        row = cur.fetchone()
        above_pct = round(100 * int(row[0] or 0) / max(int(row[1] or 1), 1), 1) if row else 0
        
        # 신고가/신저가 수
        cur.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE extreme_type = 'high') as highs,
                COUNT(*) FILTER (WHERE extreme_type = 'low') as lows
            FROM market.weekly_52_extremes WHERE trade_date = %s
        """, (td,))
        hl_row = cur.fetchone()
        highs = int(hl_row[0] or 0) if hl_row else 0
        lows = int(hl_row[1] or 0) if hl_row else 0
        
        breadth_data.append({
            'date': td.isoformat(),
            'aboveMa20Pct': above_pct,
            'newHighs': highs,
            'newLows': lows,
            'spread': highs - lows,
        })
    
    save('breadth.json', breadth_data)

# ─── THEMES (Level 2) ───
def extract_themes(cur, latest):
    # Load naver themes
    themes_path = '/Users/home_mac_mini/.openclaw/workspace/kospi200_etl/naver_theme_stocks.json'
    classifications_path = '/Users/home_mac_mini/.openclaw/workspace/kospi200_etl/stock_classifications.json'
    
    with open(themes_path, 'r') as f:
        naver_themes = json.load(f)
    with open(classifications_path, 'r') as f:
        stock_cls = json.load(f)
    
    # Build theme→tickers mapping
    theme_tickers = {}
    themes_dict = naver_themes.get('themes', naver_themes)
    if isinstance(themes_dict, dict):
        for theme_id, theme_data in themes_dict.items():
            if isinstance(theme_data, dict):
                name = theme_data.get('name', '')
                stocks = theme_data.get('stocks', [])
                tickers = [s['code'] for s in stocks if isinstance(s, dict) and 'code' in s]
                if name and tickers:
                    theme_tickers[name] = tickers
    elif isinstance(themes_dict, list):
        for theme in themes_dict:
            name = theme.get('theme') or theme.get('name', '')
            tickers = theme.get('tickers', [])
            if name and tickers:
                theme_tickers[name] = tickers
    
    # Get prev trade date
    cur.execute("SELECT DISTINCT trade_date FROM market.daily_bars WHERE trade_date < %s ORDER BY trade_date DESC LIMIT 1", (latest,))
    prev_date = cur.fetchone()[0]
    
    # Calculate theme performance
    theme_scores = []
    for theme_name, tickers in theme_tickers.items():
        if len(tickers) < 3:
            continue
        placeholders = ','.join(['%s'] * len(tickers))
        cur.execute(f"""
            SELECT 
                AVG(CASE WHEN b.close > 0 AND p.close > 0 THEN (b.close - p.close) / p.close * 100 END) as avg_return,
                COUNT(*) FILTER (WHERE b.close > p.close) as up_count,
                COUNT(*) as total
            FROM market.daily_bars b
            JOIN market.daily_bars p ON p.ticker = b.ticker AND p.trade_date = %s
            WHERE b.trade_date = %s AND b.ticker IN ({placeholders})
            AND b.volume > 0 AND b.volume IS NOT NULL
        """, [prev_date, latest] + tickers)
        row = cur.fetchone()
        if row and row[0] is not None:
            avg_ret = round(float(row[0]), 2)
            up_count = int(row[1] or 0)
            total = int(row[2] or 1)
            sync_rate = round(100 * up_count / max(total, 1), 0)
            
            # Get top 3 stocks by return
            cur.execute(f"""
                SELECT u.name, round((b.close - p.close) / p.close * 100, 1) as ret
                FROM market.daily_bars b
                JOIN market.daily_bars p ON p.ticker = b.ticker AND p.trade_date = %s
                LEFT JOIN market.universe_members u ON u.ticker = b.ticker 
                    AND u.as_of_date = (SELECT MAX(as_of_date) FROM market.universe_members)
                WHERE b.trade_date = %s AND b.ticker IN ({placeholders})
                AND b.volume > 0
                ORDER BY ret DESC LIMIT 3
            """, [prev_date, latest] + tickers)
            top_stocks = [r[0] or '' for r in cur.fetchall()]
            
            theme_scores.append({
                'name': theme_name,
                'changePercent': avg_ret,
                'syncRate': sync_rate,
                'stockCount': total,
                'topStocks': top_stocks,
            })
    
    # Sort by avg return
    theme_scores.sort(key=lambda x: x['changePercent'], reverse=True)
    
    # Add rank
    for i, t in enumerate(theme_scores):
        t['rank'] = i + 1
    
    # Heatmap data: top 25 + bottom 25 for balanced view
    top_25 = theme_scores[:25]
    bottom_25 = theme_scores[-25:] if len(theme_scores) > 25 else []
    # Merge and deduplicate
    heatmap_themes = top_25 + [t for t in bottom_25 if t not in top_25]
    heatmap = [{'name': t['name'], 'value': max(abs(t['changePercent']), 0.1), 'change': t['changePercent']} 
               for t in heatmap_themes]
    
    # Bottom 10 (worst performing)
    bottom10 = theme_scores[-10:][::-1] if len(theme_scores) >= 10 else []
    
    save('themes.json', {
        'top10': theme_scores[:10],
        'bottom10': bottom10,
        'heatmap': heatmap,
        'total': len(theme_scores),
    })

# ─── SCANNER: 52-WEEK NEW HIGHS (Level 3) ───
def extract_scanner_newhigh(cur, latest):
    cur.execute("""
        SELECT w.ticker, w.name, w.close, w.change_pct, w.volume,
            mc.market_cap, mc.sector_name
        FROM market.weekly_52_extremes w
        LEFT JOIN market.market_caps mc ON mc.ticker = w.ticker AND mc.trade_date = %s
        WHERE w.trade_date = %s AND w.extreme_type = 'high'
        AND w.volume > 0 AND w.volume IS NOT NULL
        ORDER BY mc.market_cap DESC NULLS LAST
    """, (latest, latest))
    
    rows = []
    for r in cur.fetchall():
        rows.append({
            'ticker': r[0],
            'name': r[1] or '',
            'close': float(r[2] or 0),
            'changePct': round(float(r[3] or 0), 1),
            'volume': float(r[4] or 0),
            'marketCap': round(float(r[5] or 0), 0) if r[5] else 0,  # already in 억원 from DB
            'sector': r[6] or '',
        })
    
    save('scanner-newhigh.json', rows)

# ─── SCANNER: 52-WEEK NEW LOWS (Level 3) ───
def extract_scanner_newlow(cur, latest):
    cur.execute("""
        SELECT w.ticker, w.name, w.close, w.change_pct, w.volume,
            mc.market_cap, mc.sector_name
        FROM market.weekly_52_extremes w
        LEFT JOIN market.market_caps mc ON mc.ticker = w.ticker AND mc.trade_date = %s
        WHERE w.trade_date = %s AND w.extreme_type = 'low'
        AND w.volume > 0 AND w.volume IS NOT NULL
        ORDER BY mc.market_cap DESC NULLS LAST
    """, (latest, latest))
    
    rows = []
    for r in cur.fetchall():
        rows.append({
            'ticker': r[0],
            'name': r[1] or '',
            'close': float(r[2] or 0),
            'changePct': round(float(r[3] or 0), 1),
            'volume': float(r[4] or 0),
            'marketCap': round(float(r[5] or 0), 0) if r[5] else 0,
            'sector': r[6] or '',
        })
    
    save('scanner-newlow.json', rows)

# ─── MAIN ───
def main():
    print("📊 Extracting market data...")
    conn = get_conn()
    cur = conn.cursor()
    
    latest = get_latest_trade_date(cur)
    trade_dates = get_trade_dates(cur, 60)
    print(f"  Latest: {latest}, dates: {len(trade_dates)}")
    
    extract_meta(cur, latest)
    extract_index(cur, 'KOSPI', latest, trade_dates)
    extract_index(cur, 'KOSDAQ', latest, trade_dates)
    extract_market_summary(cur, latest, trade_dates)
    extract_breadth(cur, latest, trade_dates)
    extract_themes(cur, latest)
    extract_scanner_newhigh(cur, latest)
    extract_scanner_newlow(cur, latest)
    
    conn.close()
    print("✅ All data extracted!")

if __name__ == '__main__':
    main()
