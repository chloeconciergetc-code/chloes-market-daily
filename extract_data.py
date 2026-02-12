#!/usr/bin/env python3
"""Extract market data from PostgreSQL and write to src/data/market-data.json"""
import json
import psycopg2
from datetime import date

conn = psycopg2.connect(dbname='marketdata', user='kospi_etl', host='localhost', password='sGMUuS8cEyvij4xPVIUE3IDZ')
cur = conn.cursor()

LATEST = '2026-02-11'

data = {}

# 1. 52-week highs list
cur.execute("""
    SELECT ticker, name, close, change_pct, volume
    FROM market.weekly_52_extremes
    WHERE extreme_type='high' AND trade_date=%s
    ORDER BY close::numeric * volume::numeric DESC
""", (LATEST,))
data['highStocks'] = [
    {'ticker': r[0], 'name': r[1], 'close': float(r[2]), 'changePct': float(r[3]), 'volume': int(r[4])}
    for r in cur.fetchall()
]

# 2. 52-week high trend (last 7+ trading days)
cur.execute("""
    SELECT trade_date, COUNT(*) as cnt
    FROM market.weekly_52_extremes
    WHERE extreme_type='high' AND trade_date >= '2026-02-02'
    GROUP BY trade_date ORDER BY trade_date
""")
data['highTrend'] = [{'date': str(r[0]), 'count': r[1]} for r in cur.fetchall()]

# 3. Market summary (advances/declines/trading value)
cur.execute("""
    WITH latest AS (
        SELECT d.ticker, d.close, d.volume,
            LAG(d.close) OVER (PARTITION BY d.ticker ORDER BY d.trade_date) as prev_close
        FROM market.daily_bars d
        WHERE d.trade_date IN (%s, (SELECT MAX(trade_date) FROM market.daily_bars WHERE trade_date < %s))
    )
    SELECT
        COUNT(*) FILTER (WHERE close > prev_close) as advances,
        COUNT(*) FILTER (WHERE close < prev_close) as declines,
        COUNT(*) FILTER (WHERE close = prev_close) as unchanged,
        ROUND(SUM(close * volume) FILTER (WHERE prev_close IS NOT NULL) / 100000000, 0) as trading_value
    FROM latest WHERE prev_close IS NOT NULL
""", (LATEST, LATEST))
row = cur.fetchone()
data['marketSummary'] = {
    'date': LATEST,
    'advances': row[0],
    'declines': row[1],
    'unchanged': row[2],
    'tradingValue': int(row[3]),  # 억원
}

# 4. Theme leaders - using classify_stocks
import sys
sys.path.insert(0, '/Users/home_mac_mini/.openclaw/workspace/kospi200_etl')
from classify_stocks import classify_all, get_theme_config

# Get weekly_extreme_summary for theme classification
cur.execute("""
    SELECT ticker, name, high_count, high_dates, 0, NULL, latest_close, latest_volume
    FROM market.weekly_extreme_summary
    WHERE trade_date=%s AND high_count > 0
    ORDER BY high_count DESC
""", (LATEST,))
summary_rows = cur.fetchall()
extremes = [
    (r[0], r[1], r[2], r[3], r[4], r[5], r[6],
     round(float(r[6] or 0) * float(r[7] or 0) / 100000000.0, 1) if r[6] and r[7] else 0)
    for r in summary_rows
]

classified = classify_all(extremes)
# Count stocks per theme and sort
theme_counts = []
for theme, stocks in classified.items():
    if theme == '기타':
        continue
    config = get_theme_config(theme)
    theme_counts.append({
        'name': theme,
        'count': len(stocks),
        'color': config.get('color', '#888'),
        'icon': config.get('icon', '📊'),
        'stocks': [{'ticker': s[0], 'name': s[1], 'highCount': s[2]} for s in stocks[:5]]
    })
theme_counts.sort(key=lambda x: x['count'], reverse=True)
data['themes'] = theme_counts[:10]

# 5. Total high count for today
data['marketSummary']['totalHighs'] = len(data['highStocks'])

conn.close()

with open('src/data/market-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Exported {len(data['highStocks'])} high stocks, {len(data['highTrend'])} trend days, {len(data['themes'])} themes")
