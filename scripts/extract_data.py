#!/usr/bin/env python3
"""Extract market data from PostgreSQL → static JSON for Chloe's Market Daily v2."""
import json, os, sys
from datetime import datetime, date, timedelta
from decimal import Decimal
import math
import psycopg2
from dotenv import load_dotenv
import yfinance as yf
from pykrx import stock as pykrx_stock

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
                COUNT(*) FILTER (WHERE b.close = prev.close) as flat
            FROM market.daily_bars b
            JOIN LATERAL (
                SELECT close FROM market.daily_bars p 
                WHERE p.ticker = b.ticker AND p.trade_date < %s 
                ORDER BY p.trade_date DESC LIMIT 1
            ) prev ON true
            WHERE b.trade_date = %s AND b.volume > 0 AND b.volume IS NOT NULL
        """, (td, td))
        row = cur.fetchone()
        # Compute trading value separately (no LATERAL needed)
        cur.execute("""
            SELECT COALESCE(SUM(close * volume) / 1e12, 0)
            FROM market.daily_bars
            WHERE trade_date = %s AND volume > 0 AND close > 0
        """, (td,))
        tv_row = cur.fetchone()
        if row:
            up, down, flat = int(row[0] or 0), int(row[1] or 0), int(row[2] or 0)
            tv = round(float(tv_row[0] if tv_row and tv_row[0] else 0), 1)
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
    
    # Phase 2: 거래대금 집중도 계산 (테마별 거래대금 / 전체 거래대금)
    cur.execute("""
        SELECT COALESCE(SUM(close * volume), 0) FROM market.daily_bars
        WHERE trade_date = %s AND volume > 0 AND close > 0
    """, (latest,))
    total_trade_val = float(cur.fetchone()[0] or 1)
    
    for ts in theme_scores:
        tickers = theme_tickers.get(ts['name'], [])
        if tickers:
            placeholders = ','.join(['%s'] * len(tickers))
            cur.execute(f"""
                SELECT COALESCE(SUM(close * volume), 0)
                FROM market.daily_bars
                WHERE trade_date = %s AND ticker IN ({placeholders}) AND volume > 0
            """, [latest] + tickers)
            theme_tv = float(cur.fetchone()[0] or 0)
            ts['tradingValueConc'] = round(theme_tv / total_trade_val * 100, 2)
        else:
            ts['tradingValueConc'] = 0
    
    # Phase 2: 테마별 시총 합계 (히트맵 size용)
    for ts in theme_scores:
        tickers = theme_tickers.get(ts['name'], [])
        if tickers:
            placeholders = ','.join(['%s'] * len(tickers))
            cur.execute(f"""
                SELECT COALESCE(SUM(market_cap), 0)
                FROM market.market_caps
                WHERE trade_date = %s AND ticker IN ({placeholders})
            """, [latest] + tickers)
            ts['totalMarketCap'] = round(float(cur.fetchone()[0] or 0), 0)
        else:
            ts['totalMarketCap'] = 0
    
    # Phase 2: prevRank 계산 (전일 기준 테마 순위)
    prev_ranks = {}
    cur.execute("SELECT DISTINCT trade_date FROM market.daily_bars WHERE trade_date < %s ORDER BY trade_date DESC LIMIT 1", (latest,))
    prev2_row = cur.fetchone()
    if prev2_row:
        prev2_date = prev2_row[0]
        # 전일 이전 거래일
        cur.execute("SELECT DISTINCT trade_date FROM market.daily_bars WHERE trade_date < %s ORDER BY trade_date DESC LIMIT 1", (prev2_date,))
        prev3_row = cur.fetchone()
        if prev3_row:
            prev3_date = prev3_row[0]
            # 전일 테마 등락률 계산
            prev_theme_rets = []
            for theme_name, tickers in theme_tickers.items():
                if len(tickers) < 3:
                    continue
                placeholders = ','.join(['%s'] * len(tickers))
                cur.execute(f"""
                    SELECT AVG(CASE WHEN b.close > 0 AND p.close > 0 THEN (b.close - p.close) / p.close * 100 END)
                    FROM market.daily_bars b
                    JOIN market.daily_bars p ON p.ticker = b.ticker AND p.trade_date = %s
                    WHERE b.trade_date = %s AND b.ticker IN ({placeholders}) AND b.volume > 0
                """, [prev3_date, prev2_date] + tickers)
                row = cur.fetchone()
                if row and row[0] is not None:
                    prev_theme_rets.append((theme_name, float(row[0])))
            prev_theme_rets.sort(key=lambda x: x[1], reverse=True)
            for i, (name, _) in enumerate(prev_theme_rets):
                prev_ranks[name] = i + 1
    
    # Sort by avg return
    theme_scores.sort(key=lambda x: x['changePercent'], reverse=True)
    
    # Add rank + prevRank
    for i, t in enumerate(theme_scores):
        t['rank'] = i + 1
        t['prevRank'] = prev_ranks.get(t['name'])  # Phase 2: 전일 순위
    
    # Phase 2: Heatmap - size를 시총 기반으로
    top_25 = theme_scores[:25]
    bottom_25 = theme_scores[-25:] if len(theme_scores) > 25 else []
    heatmap_themes = top_25 + [t for t in bottom_25 if t not in top_25]
    heatmap = [{'name': t['name'], 
                'value': max(t.get('totalMarketCap', 0), 1),  # Phase 2: 시총 기반 size
                'change': t['changePercent']} 
               for t in heatmap_themes]
    
    # Phase 2: 섹터별 등락률 계산
    sector_performance = []
    cur.execute("""
        SELECT mc.sector_name,
            AVG(CASE WHEN b.close > 0 AND p.close > 0 THEN (b.close - p.close) / p.close * 100 END) as avg_ret,
            SUM(mc.market_cap) as total_cap,
            COUNT(*) as cnt
        FROM market.market_caps mc
        JOIN market.daily_bars b ON b.ticker = mc.ticker AND b.trade_date = mc.trade_date
        JOIN market.daily_bars p ON p.ticker = b.ticker AND p.trade_date = %s
        WHERE mc.trade_date = %s AND mc.sector_name IS NOT NULL AND mc.sector_name != ''
        AND b.volume > 0
        GROUP BY mc.sector_name
        HAVING COUNT(*) >= 3
        ORDER BY avg_ret DESC
    """, (prev_date, latest))
    for r in cur.fetchall():
        sector_performance.append({
            'name': r[0],
            'changePercent': round(float(r[1] or 0), 2),
            'totalMarketCap': round(float(r[2] or 0), 0),
            'stockCount': int(r[3]),
        })
    
    # Bottom 10 (worst performing)
    bottom10 = theme_scores[-10:][::-1] if len(theme_scores) >= 10 else []
    
    save('themes.json', {
        'top10': theme_scores[:10],
        'bottom10': bottom10,
        'heatmap': heatmap,
        'total': len(theme_scores),
        'sectorPerformance': sector_performance,  # Phase 2: 섹터별 등락률
    })

# ─── SCANNER: 52-WEEK NEW HIGHS (Level 3) ───
def extract_scanner_newhigh(cur, latest):
    cur.execute("""
        SELECT w.ticker, w.name, w.close, w.change_pct, w.volume,
            mc.market_cap, mc.sector_name,
            COALESCE(avg20.avg_vol, 0) as avg_vol_20d
        FROM market.weekly_52_extremes w
        LEFT JOIN market.market_caps mc ON mc.ticker = w.ticker AND mc.trade_date = %s
        LEFT JOIN LATERAL (
            SELECT AVG(sub.volume) as avg_vol FROM (
                SELECT volume FROM market.daily_bars d
                WHERE d.ticker = w.ticker AND d.trade_date < %s AND d.volume > 0
                ORDER BY d.trade_date DESC LIMIT 20
            ) sub
        ) avg20 ON true
        WHERE w.trade_date = %s AND w.extreme_type = 'high'
        AND w.volume > 0 AND w.volume IS NOT NULL
        ORDER BY mc.market_cap DESC NULLS LAST
    """, (latest, latest, latest))
    
    rows = []
    for r in cur.fetchall():
        vol = float(r[4] or 0)
        avg_vol = float(r[7] or 0)
        vol_ratio = round(vol / avg_vol, 1) if avg_vol > 0 else None
        rows.append({
            'ticker': r[0],
            'name': r[1] or '',
            'close': float(r[2] or 0),
            'changePct': round(float(r[3] or 0), 1),
            'volume': vol,
            'marketCap': round(float(r[5] or 0), 0) if r[5] else 0,
            'sector': r[6] or '',
            'volRatio': vol_ratio,  # Phase 2: 거래량 대비 20일 평균
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

# ─── INVESTOR FLOW (Phase 3) ───
def extract_investor_flow(cur, latest, trade_dates):
    """외국인/기관 수급 데이터 수집 (pykrx)."""
    recent_20 = trade_dates[-20:]
    fmt = lambda d: d.strftime('%Y%m%d')

    start_str = fmt(recent_20[0])
    end_str = fmt(recent_20[-1])

    result = {'kospi': [], 'kosdaq': []}

    for market, key in [('KOSPI', 'kospi'), ('KOSDAQ', 'kosdaq')]:
        try:
            df_val = pykrx_stock.get_market_trading_value_by_date(start_str, end_str, market)
            if df_val.empty:
                continue
            for idx, row in df_val.iterrows():
                td = idx.date() if hasattr(idx, 'date') else idx
                result[key].append({
                    'date': td.isoformat(),
                    'foreign': round(float(row.get('외국인합계', 0)) / 1e8, 0),   # 억원
                    'institution': round(float(row.get('기관합계', 0)) / 1e8, 0),
                    'individual': round(float(row.get('개인', 0)) / 1e8, 0),
                    'otherCorp': round(float(row.get('기타법인', 0)) / 1e8, 0),
                })
        except Exception as e:
            print(f"  ⚠️ Investor flow {market} error: {e}")

    save('investor-flow.json', result)


# ─── MARKET REGIME (Phase 3) ───
def extract_market_regime(cur, latest, trade_dates, breadth_data=None):
    """시장 체온 종합 점수 계산.
    Components (0-100 each, weighted):
      - ADR (20%): advance/decline ratio
      - Breadth (20%): % above MA20
      - New High/Low spread (15%)
      - Trading value vs 20d avg (15%)
      - Foreign flow (15%): 5-day cumulative
      - Volatility (15%): inverse of recent volatility
    """
    # Get latest summary data
    cur.execute("""
        SELECT 
            COUNT(*) FILTER (WHERE b.close > prev.close),
            COUNT(*) FILTER (WHERE b.close < prev.close)
        FROM market.daily_bars b
        JOIN LATERAL (
            SELECT close FROM market.daily_bars p 
            WHERE p.ticker = b.ticker AND p.trade_date < %s 
            ORDER BY p.trade_date DESC LIMIT 1
        ) prev ON true
        WHERE b.trade_date = %s AND b.volume > 0
    """, (latest, latest))
    row = cur.fetchone()
    up, down = int(row[0] or 0), int(row[1] or 0)
    adr = up / max(down, 1)

    # ADR score: 0.5→0, 1.0→50, 2.0→100
    adr_score = min(max((adr - 0.5) / 1.5 * 100, 0), 100)

    # Breadth: % above MA20
    cur.execute("""
        WITH stock_ma AS (
            SELECT b.ticker, b.close, AVG(b2.close) as ma20
            FROM market.daily_bars b
            JOIN market.daily_bars b2 ON b2.ticker = b.ticker 
                AND b2.trade_date <= %s AND b2.trade_date > %s - interval '30 days'
            WHERE b.trade_date = %s AND b.volume > 0
            GROUP BY b.ticker, b.close HAVING COUNT(b2.*) >= 15
        )
        SELECT COUNT(*) FILTER (WHERE close > ma20), COUNT(*) FROM stock_ma
    """, (latest, latest, latest))
    br = cur.fetchone()
    breadth_pct = 100 * int(br[0] or 0) / max(int(br[1] or 1), 1)
    breadth_score = min(max(breadth_pct, 0), 100)

    # New High/Low spread score
    cur.execute("""
        SELECT 
            COUNT(*) FILTER (WHERE extreme_type = 'high'),
            COUNT(*) FILTER (WHERE extreme_type = 'low')
        FROM market.weekly_52_extremes WHERE trade_date = %s
    """, (latest,))
    hl = cur.fetchone()
    highs, lows = int(hl[0] or 0), int(hl[1] or 0)
    hl_ratio = highs / max(highs + lows, 1)
    hl_score = hl_ratio * 100

    # Trading value ratio
    cur.execute("""
        SELECT SUM(close * volume) / 1e12 FROM market.daily_bars
        WHERE trade_date = %s AND volume > 0
    """, (latest,))
    tv_today = float(cur.fetchone()[0] or 0)
    cur.execute("""
        SELECT AVG(daily_tv) FROM (
            SELECT trade_date, SUM(close * volume) / 1e12 as daily_tv
            FROM market.daily_bars WHERE trade_date <= %s AND volume > 0 
              AND volume IS NOT NULL AND volume != 'NaN' AND close > 0
            GROUP BY trade_date ORDER BY trade_date DESC LIMIT 20
        ) sub WHERE daily_tv IS NOT NULL AND daily_tv != 'NaN'
    """, (latest,))
    tv_avg_row = cur.fetchone()
    tv_avg = float(tv_avg_row[0]) if tv_avg_row and tv_avg_row[0] and not math.isnan(float(tv_avg_row[0])) else 0
    tv_ratio = tv_today / max(tv_avg, 0.01) if tv_today and tv_avg else 1.0
    # 0.5→0, 1.0→50, 1.5→100
    tv_score = min(max((tv_ratio - 0.5) * 100, 0), 100)

    # Foreign flow: 5-day cumulative (pykrx)
    recent_5 = trade_dates[-5:]
    foreign_score = 50  # default neutral
    try:
        df = pykrx_stock.get_market_trading_value_by_date(
            recent_5[0].strftime('%Y%m%d'), recent_5[-1].strftime('%Y%m%d'), 'KOSPI')
        if not df.empty:
            cum_foreign = float(df['외국인합계'].sum()) / 1e8  # 억원
            # Normalize: -5000억→0, 0→50, +5000억→100
            foreign_score = min(max((cum_foreign / 5000 + 1) * 50, 0), 100)
    except:
        pass

    # Volatility (inverse): low vol = bullish
    cur.execute("""
        SELECT STDDEV(daily_ret) FROM (
            SELECT (close - prev_c) / NULLIF(prev_c, 0) * 100 as daily_ret FROM (
                SELECT close, LAG(close) OVER (ORDER BY trade_date) as prev_c
                FROM (SELECT trade_date, AVG(close) as close FROM market.daily_bars 
                      WHERE trade_date >= %s - interval '20 days' AND trade_date <= %s AND volume > 0
                      GROUP BY trade_date ORDER BY trade_date) sub
            ) sub2 WHERE prev_c IS NOT NULL
        ) sub3
    """, (latest, latest))
    vol_row = cur.fetchone()
    volatility = float(vol_row[0] or 1) if vol_row and vol_row[0] else 1
    # Low vol (0.5) → 100, High vol (3.0) → 0
    vol_score = min(max((3.0 - volatility) / 2.5 * 100, 0), 100)

    # Weighted composite
    weights = {'adr': 0.20, 'breadth': 0.20, 'hlSpread': 0.15, 'tradingValue': 0.15, 'foreignFlow': 0.15, 'volatility': 0.15}
    components = {
        'adr': round(adr_score, 1),
        'breadth': round(breadth_score, 1),
        'hlSpread': round(hl_score, 1),
        'tradingValue': round(tv_score, 1),
        'foreignFlow': round(foreign_score, 1),
        'volatility': round(vol_score, 1),
    }
    composite = sum((components[k] or 50) * weights[k] for k in weights)

    # Regime label
    if composite >= 70:
        regime = 'risk-on'
        label = '🟢 Risk-On (강세)'
    elif composite >= 55:
        regime = 'neutral-bullish'
        label = '🟡 중립-강세'
    elif composite >= 45:
        regime = 'neutral'
        label = '⚪ 중립'
    elif composite >= 30:
        regime = 'neutral-bearish'
        label = '🟠 중립-약세'
    else:
        regime = 'risk-off'
        label = '🔴 Risk-Off (약세)'

    save('market-regime.json', {
        'date': latest.isoformat(),
        'composite': round(composite, 1),
        'regime': regime,
        'label': label,
        'components': components,
        'weights': weights,
    })


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
    extract_investor_flow(cur, latest, trade_dates)
    extract_market_regime(cur, latest, trade_dates)
    
    conn.close()
    print("✅ All data extracted!")

if __name__ == '__main__':
    main()
