#!/usr/bin/env python3
"""Extract market data from PostgreSQL → public/data/ JSON files."""
import json, os, sys
from datetime import date, timedelta, datetime
from decimal import Decimal
import psycopg2

DB = dict(host='localhost', port=5432, dbname='marketdata', user='kospi_etl',
          password=os.environ.get('PGPASSWORD', 'sGMUuS8cEyvij4xPVIUE3IDZ'))
OUT = os.path.join(os.path.dirname(__file__), 'public', 'data')
os.makedirs(OUT, exist_ok=True)

def dec(v):
    if isinstance(v, Decimal): return float(v)
    if isinstance(v, (date, datetime)): return v.isoformat()
    if isinstance(v, list): return [dec(x) for x in v]
    return v

def dump(name, data):
    with open(os.path.join(OUT, name), 'w') as f:
        json.dump(data, f, ensure_ascii=False, default=dec, indent=None)
    print(f"  ✓ {name}")

def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Latest trade date
    cur.execute("SELECT MAX(trade_date) FROM market.daily_bars")
    latest = cur.fetchone()[0]
    print(f"Latest trade date: {latest}")
    
    d60_ago = latest - timedelta(days=90)  # ~60 trading days

    # ── market-summary.json ──
    print("Generating market-summary.json...")
    cur.execute("""
        WITH prev_day AS (
            SELECT MAX(trade_date) AS d FROM market.daily_bars WHERE trade_date < %s
        ), today AS (
            SELECT a.ticker, a.close, a.volume, b.close AS prev_close
            FROM market.daily_bars a
            JOIN market.daily_bars b ON a.ticker = b.ticker AND b.trade_date = (SELECT d FROM prev_day)
            WHERE a.trade_date = %s
        )
        SELECT
            COUNT(*) FILTER (WHERE close > prev_close) AS up,
            COUNT(*) FILTER (WHERE close < prev_close) AS down,
            COUNT(*) FILTER (WHERE close = prev_close) AS flat,
            ROUND(AVG(close / NULLIF(prev_close,0)) * 100, 2) AS adr,
            COALESCE(ROUND(SUM(close * volume) / 1e8, 0), 0) AS trading_value_억
        FROM today
    """, (latest, latest))
    row = cur.fetchone()
    
    # Sparkline: last 20 trading days aggregate advance count
    cur.execute("""
        WITH ranked AS (
            SELECT trade_date, ticker, close,
                   LAG(close) OVER (PARTITION BY ticker ORDER BY trade_date) AS prev
            FROM market.daily_bars
            WHERE trade_date >= %s - INTERVAL '40 days'
        )
        SELECT trade_date,
               COUNT(*) FILTER (WHERE close > prev) AS advances,
               COUNT(*) FILTER (WHERE close < prev) AS declines
        FROM ranked
        WHERE trade_date >= %s - INTERVAL '30 days' AND prev IS NOT NULL
        GROUP BY trade_date ORDER BY trade_date
    """, (latest, latest))
    spark_rows = cur.fetchall()
    sparkline = [{"d": r[0].isoformat(), "adv": r[1], "dec": r[2]} for r in spark_rows[-20:]]

    dump("market-summary.json", {
        "date": latest.isoformat(),
        "advances": row[0], "declines": row[1], "flat": row[2],
        "adr": float(row[3]) if row[3] else 100,
        "tradingValue": float(row[4]) if row[4] and str(row[4]) != 'NaN' else 0,
        "sparkline": sparkline
    })

    # ── index-kospi.json / index-kosdaq.json ──
    for market, label, rep_ticker in [("KOSPI", "kospi", "005930"), ("KOSDAQ", "kosdaq", "263750")]:
        print(f"Generating index-{label}.json...")
        # Get universe tickers
        cur.execute("SELECT ticker FROM market.universe_members WHERE universe=%s", (market,))
        tickers = [r[0] for r in cur.fetchall()]
        
        if rep_ticker in tickers:
            # Use representative stock for candlestick
            cur.execute("""
                SELECT trade_date, open, high, low, close, volume
                FROM market.daily_bars
                WHERE ticker=%s AND trade_date >= %s
                ORDER BY trade_date
            """, (rep_ticker, d60_ago))
        else:
            # Fallback to first available
            cur.execute("""
                SELECT trade_date, open, high, low, close, volume
                FROM market.daily_bars
                WHERE ticker=%s AND trade_date >= %s
                ORDER BY trade_date
            """, (tickers[0] if tickers else '005930', d60_ago))
        
        bars = cur.fetchall()
        candles = []
        closes = []
        for r in bars:
            candles.append({"d": r[0].isoformat(), "o": float(r[1]), "h": float(r[2]),
                           "l": float(r[3]), "c": float(r[4]), "v": float(r[5])})
            closes.append(float(r[4]))
        
        # Compute MA20, MA60
        for i, c in enumerate(candles):
            c["ma20"] = round(sum(closes[max(0,i-19):i+1]) / min(i+1, 20), 0) if i >= 0 else None
            c["ma60"] = round(sum(closes[max(0,i-59):i+1]) / min(i+1, 60), 0) if i >= 0 else None

        name_map = {"005930": "삼성전자", "263750": "펄어비스"}
        cur.execute("SELECT name FROM market.universe_members WHERE ticker=%s LIMIT 1", (rep_ticker,))
        rn = cur.fetchone()
        stock_name = rn[0] if rn else name_map.get(rep_ticker, rep_ticker)

        dump(f"index-{label}.json", {
            "market": market, "ticker": rep_ticker, "name": stock_name,
            "candles": candles[-60:]
        })

    # ── breadth.json ──
    print("Generating breadth.json...")
    cur.execute("""
        WITH daily_ma AS (
            SELECT trade_date, ticker, close,
                   AVG(close) OVER (PARTITION BY ticker ORDER BY trade_date ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) AS ma20
            FROM market.daily_bars
            WHERE trade_date >= %s - INTERVAL '60 days'
        )
        SELECT trade_date,
               ROUND(100.0 * COUNT(*) FILTER (WHERE close > ma20) / NULLIF(COUNT(*), 0), 1) AS pct_above_ma20,
               COUNT(*) FILTER (WHERE close > ma20) AS above,
               COUNT(*) AS total
        FROM daily_ma
        WHERE trade_date >= %s
        GROUP BY trade_date ORDER BY trade_date
    """, (d60_ago, d60_ago))
    breadth_rows = cur.fetchall()
    
    # New highs/lows per day
    cur.execute("""
        SELECT trade_date,
               COUNT(*) FILTER (WHERE extreme_type='high') AS new_highs,
               COUNT(*) FILTER (WHERE extreme_type='low') AS new_lows
        FROM market.weekly_52_extremes
        WHERE trade_date >= %s
        GROUP BY trade_date ORDER BY trade_date
    """, (d60_ago,))
    hl_map = {r[0].isoformat(): {"highs": r[1], "lows": r[2]} for r in cur.fetchall()}

    breadth = []
    for r in breadth_rows[-30:]:
        d = r[0].isoformat()
        hl = hl_map.get(d, {"highs": 0, "lows": 0})
        breadth.append({"d": d, "aboveMa20Pct": float(r[1]) if r[1] else 0, **hl})

    dump("breadth.json", breadth)

    # ── themes.json ──
    print("Generating themes.json...")
    # Load theme data
    theme_file = os.path.join(os.path.dirname(__file__), '..', 'kospi200_etl', 'naver_theme_stocks.json')
    class_file = os.path.join(os.path.dirname(__file__), '..', 'kospi200_etl', 'stock_classifications.json')
    
    themes_data = {}
    if os.path.exists(theme_file):
        with open(theme_file) as f:
            themes_data = json.load(f).get('themes', {})
    
    classifications = {}
    if os.path.exists(class_file):
        with open(class_file) as f:
            classifications = json.load(f)

    # Get latest day returns for all stocks
    cur.execute("""
        WITH t AS (
            SELECT ticker, close,
                   LAG(close) OVER (PARTITION BY ticker ORDER BY trade_date) AS prev
            FROM market.daily_bars
            WHERE trade_date >= %s - INTERVAL '3 days' AND trade_date <= %s
        )
        SELECT ticker, close, prev,
               CASE WHEN prev > 0 THEN ROUND((close - prev) / prev * 100, 2) END AS chg_pct
        FROM t WHERE prev IS NOT NULL
    """, (latest, latest))
    stock_returns = {}
    for r in cur.fetchall():
        stock_returns[r[0]] = {"close": float(r[1]), "chg": float(r[3]) if r[3] else 0}

    # Get market caps for treemap sizing
    cur.execute("SELECT ticker, market_cap FROM market.market_caps WHERE trade_date=%s", (latest,))
    mcaps = {r[0]: float(r[1]) for r in cur.fetchall() if r[1] is not None}

    # Compute theme performance
    theme_perf = []
    for tid, tdata in themes_data.items():
        stocks = tdata.get('stocks', [])
        if not stocks: continue
        chgs = [stock_returns[s['code']]['chg'] for s in stocks if s['code'] in stock_returns]
        if len(chgs) < 2: continue
        avg_chg = sum(chgs) / len(chgs)
        top_stocks = []
        for s in stocks[:5]:
            code = s['code']
            if code in stock_returns:
                cap = mcaps.get(code, 0)
                top_stocks.append({"ticker": code, "name": s['name'],
                                   "chg": stock_returns[code]['chg'],
                                   "cap": cap})
        theme_perf.append({
            "id": tid, "name": tdata['name'], "avgChg": round(avg_chg, 2),
            "count": len(chgs), "stocks": sorted(top_stocks, key=lambda x: -x['chg'])
        })

    theme_perf.sort(key=lambda x: -x['avgChg'])
    
    # Treemap: sector-based
    sector_map = {}
    for ticker, info in classifications.items():
        sector = info.get('sector', '기타')
        if ticker in stock_returns and ticker in mcaps:
            if sector not in sector_map:
                sector_map[sector] = {"name": sector, "cap": 0, "chg_sum": 0, "count": 0, "stocks": []}
            sector_map[sector]["cap"] += mcaps[ticker]
            sector_map[sector]["chg_sum"] += stock_returns[ticker]["chg"]
            sector_map[sector]["count"] += 1
            if len(sector_map[sector]["stocks"]) < 5:
                sector_map[sector]["stocks"].append({
                    "ticker": ticker, "name": info['name'],
                    "chg": stock_returns[ticker]["chg"], "cap": mcaps[ticker]
                })
    
    treemap = []
    for s in sector_map.values():
        if s["count"] > 0:
            treemap.append({
                "name": s["name"], "cap": s["cap"],
                "avgChg": round(s["chg_sum"] / s["count"], 2),
                "count": s["count"],
                "stocks": sorted(s["stocks"], key=lambda x: -x["cap"])
            })
    treemap.sort(key=lambda x: -x["cap"])

    dump("themes.json", {
        "date": latest.isoformat(),
        "topThemes": theme_perf[:10],
        "bottomThemes": theme_perf[-5:] if len(theme_perf) > 5 else [],
        "treemap": treemap[:20]
    })

    # ── scanner-newhigh.json ──
    print("Generating scanner-newhigh.json...")
    cur.execute("""
        SELECT e.trade_date, e.ticker, e.name, e.close, e.change_pct, e.volume,
               e.new_extreme_value, e.prev_extreme_value
        FROM market.weekly_52_extremes e
        WHERE e.extreme_type = 'high' AND e.trade_date = %s
        ORDER BY e.change_pct DESC
    """, (latest,))
    newhighs = []
    for r in cur.fetchall():
        cap = mcaps.get(r[1], 0)
        sector = classifications.get(r[1], {}).get('sector', '')
        newhighs.append({
            "ticker": r[1], "name": r[2], "close": float(r[3]),
            "chgPct": float(r[4]) if r[4] else 0,
            "volume": float(r[5]), "cap": cap, "sector": sector,
            "newHigh": float(r[6]) if r[6] else 0
        })
    
    dump("scanner-newhigh.json", {"date": latest.isoformat(), "stocks": newhighs})

    conn.close()
    print(f"\n✅ All data extracted for {latest}")

if __name__ == '__main__':
    main()
