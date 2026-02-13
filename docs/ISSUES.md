# Chloe's Market Daily — 문제점 진단

> 작성일: 2026-02-13 | 버전: v2.0

---

## 목차
1. [레이아웃 & 시각적 일관성](#1-레이아웃--시각적-일관성)
2. [정보 설계](#2-정보-설계)
3. [차트 & 시각화](#3-차트--시각화)
4. [코드 품질](#4-코드-품질)
5. [기능 & UX](#5-기능--ux)
6. [요약 대시보드](#6-요약-대시보드)

---

## 1. 레이아웃 & 시각적 일관성

| # | 문제 | 위치 | 심각도 | 설명 |
|---|------|------|--------|------|
| L1 | **차트 높이 불일치** | 전체 | 높음 | 캔들(300px), 오버레이(260px), 수급(220px), 히트맵(340px), Breadth(260px) — 5가지 서로 다른 높이 사용 |
| L2 | **캔들차트 half + 오버레이 full** | 차트 섹션 | 높음 | KOSPI/KOSDAQ 캔들은 `lg:grid-cols-2`(반쪽)인데, 바로 아래 오버레이는 전체 너비 → 시각적 리듬이 깨짐 |
| L3 | **섹션 간 간격 혼재** | App.tsx | 중간 | GROUP 1은 `space-y-6`, GROUP 2는 `space-y-4`, 구분선은 `my-10` — 일관성 없음 |
| L4 | **구분선 불규칙** | App.tsx | 낮음 | 일부 섹션만 `w-16 h-px` 구분선 있음, 나머지는 없음 |

### L1 상세: 차트 높이 분포

```
캔들차트 (IndexCandlestickChart)  → viewBox: 0 0 600 300  (300px)
오버레이 (IndexOverlayChart)      → viewBox: 0 0 600 260  (260px)
수급바차트 (InvestorFlow BarChart) → viewBox: 0 0 600 220  (220px)
Breadth (BreadthChart)            → ChartContainer height=260 (260px)
히트맵 (SectorHeatmap)           → 340px 고정
```

→ **표준 높이 시스템이 필요**: 주 차트(280px), 보조 차트(240px) 2단계

### L2 상세: 그리드 불일치

```
[──────── KOSPI 캔들 ────────][──────── KOSDAQ 캔들 ────────]  ← 50% + 50%
[────────────────── 오버레이 ──────────────────────────────]  ← 100%
[────────────────── 수급 바차트 ────────────────────────────]  ← 100%
[──── Breadth 1 ────────────][──── Breadth 2 ────────────────]  ← 50% + 50%
[────────────────── 테마 테이블 ────────────────────────────]  ← 100%
[────────────────── 히트맵 ────────────────────────────────]  ← 100%
```

→ 50%, 100%가 불규칙하게 교대 → **시각적 리듬**이 없음

---

## 2. 정보 설계

| # | 문제 | 위치 | 심각도 | 설명 |
|---|------|------|--------|------|
| I1 | **HeroDashboard 과밀** | HeroDashboard | 높음 | 게이지+지수가격+수급요약+레짐components pills가 한 카드에 모두 포함 → 정보 과부하 |
| I2 | **MarketPulse 중복** | MarketPulse | 높음 | ADR, 거래대금이 좌측 StatTile과 우측 ThermometerBar에 **동시 표시** |
| I3 | **상승비율 3중 표시** | MarketPulse | 중간 | UpDownBar에서 수치+바 → 우측 ThermometerBar에서 또 표시 → 공간 낭비 |
| I4 | **투자자 수급이 두 곳에** | 전체 | 중간 | HeroDashboard의 FlowSummary + InvestorFlow 섹션에서 동일 데이터 반복 |

### I2 상세: MarketPulse 중복 맵

```
┌──[좌측 StatTile]──────────────┬──[우측 ThermometerBar]──────────┐
│                                │                                  │
│  ADR: 1.5 ★                   │  상승 비율: 1487/2633 ★★         │
│  거래대금: 45.1 조원 ★        │  ADR: 1.5 ★                     │
│  52주 신고가: 165 종목        │  거래대금 비율: 0% ★             │
│                                │  MA20 돌파율: 74.5%             │
│                                │  신고/저 스프레드: 151           │
└────────────────────────────────┴──────────────────────────────────┘
★ = 좌측과 우측에서 중복
★★ = UpDownBar와도 중복
```

→ ADR이 2번, 거래대금이 2번, 상승비율이 3번 표시
→ 우측 사이드바(280px)가 **정보 대비 공간을 과다 사용**

### I4 상세: 수급 데이터 흐름 중복

```
investor-flow.json
  ├→ HeroDashboard.FlowSummary  (오늘 외/기/개 순매수)  ← 1차 표시
  └→ InvestorFlow.FlowCard      (오늘 + 5일 누적)       ← 2차 표시 (중복)
```

---

## 3. 차트 & 시각화

| # | 문제 | 위치 | 심각도 | 설명 |
|---|------|------|--------|------|
| C1 | **수급 바차트 60일 과다** | InvestorFlow | 높음 | 60일 × 3개 바 = barW ~2px → 개별 바 구분 불가, 읽기 어려움 |
| C2 | **히트맵 텍스트 잘림** | SectorHeatmap | 중간 | 작은 셀에서 이름이 잘리거나 아예 안 보임, 호버도 불가 |
| C3 | **Recharts 콘솔 경고** | BreadthChart, SectorHeatmap | 중간 | `ResponsiveContainer` → `width(-1) height(-1)` 경고 3건 |
| C4 | **차트 스타일 불통일** | 전체 차트 | 중간 | margin, fontSize, gridLine, tooltip 등이 컴포넌트마다 각각 다름 |

### C1 상세: 수급 바차트 가독성

```
현재 바 너비 계산:
  innerW = 600 - 40 - 20 = 540
  barGroupW = 540 / 60 = 9px (per day)
  barW = max(2, 9 * 0.22) = max(2, 1.98) = 2px

  → 2px 너비의 바 × 3개 = 6px per group, 3px 간격
  → 사실상 선(line)에 가까움, 바 차트의 의미 상실
```

**해결 방향:** 60일 → 30일 기본 표시 → barW ~4px (2배 개선)

### C4 상세: 차트 스타일 비교

| 속성 | 캔들차트 | 오버레이 | 수급바 | Breadth | 히트맵 |
|------|---------|---------|--------|---------|--------|
| margin.top | 10 | 10 | 10 | Recharts 기본 | — |
| margin.right | 52 | 40 | 20 | 0 | — |
| margin.bottom | 28 | 28 | 24 | 0 | — |
| margin.left | 40 | 40 | 40 | -10 | — |
| gridLine color | rgba(255,255,255,0.04) | rgba(255,255,255,0.05) | — | rgba(255,255,255,0.04) | — |
| axis fontSize | 10px | 10px | 10px | 10px | 11px |
| tooltip | 없음 | 없음 | 없음 | Recharts 기본 | 커스텀 |

→ **4가지 서로 다른 margin 체계** → 시각적 정렬 불일치

---

## 4. 코드 품질

| # | 문제 | 위치 | 심각도 | 설명 |
|---|------|------|--------|------|
| Q1 | **인라인 fontSize 50+곳** | 전체 | 중간 | `style={{ fontSize: 'var(--text-body)' }}` 패턴이 50곳 이상 반복 |
| Q2 | **탭 UI 3중 구현** | 3 파일 | 중간 | InvestorFlow, ThemeMomentum, Scanner 각각 탭 UI 별도 구현 |
| Q3 | **테이블 2중 구현** | level3/ | 중간 | NewHighTable/NewLowTable 90%+ 동일 코드, 정렬 방향만 다름 |
| Q4 | **레거시 파일 7개** | components/ 루트 | 낮음 | 미사용 컴포넌트 파일이 루트에 잔존 |
| Q5 | **미사용 패키지 4개** | package.json | 낮음 | framer-motion, lucide-react, clsx, @tanstack/react-virtual 설치만 됨 |

### Q1 상세: 인라인 fontSize 패턴

```tsx
// 현재: 모든 곳에서 이런 패턴 반복
<span style={{ fontSize: 'var(--text-caption)' }}>레이블</span>
<span style={{ fontSize: 'var(--text-body)' }}>본문</span>
<span style={{ fontSize: 'var(--text-micro)' }}>주석</span>

// 개선: CSS 유틸리티 클래스
<span className="text-caption">레이블</span>
<span className="text-body">본문</span>
<span className="text-micro">주석</span>
```

### Q2 상세: 탭 UI 중복 코드

**InvestorFlow.tsx:121-130**
```tsx
{['kospi', 'kosdaq'].map(m => (
  <button onClick={() => setMarket(m)}
    className={market === m
      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
    }>
    {m.toUpperCase()}
  </button>
))}
```

**ThemeMomentum.tsx:108-129** — 거의 동일한 코드, 색상만 다름 (초록/빨강)

**NewHighTable.tsx:10-20** — SortButton도 유사 패턴

→ **하나의 `TabGroup` 컴포넌트**로 통합 필요

### Q3 상세: NewHighTable vs NewLowTable 비교

```
공통 코드: ~70줄 (90%+)
  - 상태 관리: useState(sortConfig)
  - 정렬 로직: useMemo(sorted)
  - 테이블 헤더: 동일 구조
  - 테이블 바디: 동일 구조
  - 반응형 숨김: 동일 (md:, lg:)

차이점: ~5줄 (10%)
  - 제목: "52주 신고가" vs "52주 신저가"
  - 아이콘: 📈 vs 📉
  - changePct 정렬 방향: desc vs asc
  - SortButton: 외부 추출 vs 인라인
```

→ 하나의 `DataTable` + `ScannerSection`으로 통합 가능

### Q4 상세: 레거시 파일 목록

```
src/components/
├── GlassCard.tsx        ← ui/Card.tsx로 대체됨
├── MetricCard.tsx       ← 어디서도 import 안 됨
├── SignalLight.tsx      ← ui/SignalLight.tsx 중복
├── MiniSparkline.tsx    ← ui/Sparkline.tsx 중복
├── CandlestickChart.tsx ← charts/IndexCandlestickChart.tsx로 대체됨
├── BreadthChart.tsx     ← level2/BreadthChart.tsx로 대체됨
└── HighLowSpread.tsx    ← 어디서도 import 안 됨

src/components/ui/
└── GlassCard.tsx        ← deprecated, Card.tsx로 대체됨

src/components/level1/
├── IndexSummary.tsx     ← HeroDashboard로 대체됨
└── MarketRegime.tsx     ← HeroDashboard로 대체됨

src/components/level2/
└── SectorPerformance.tsx ← 어디서도 import 안 됨

src/hooks/
└── useData.ts           ← useMarketData.ts 사용 중, 미사용

src/types/
└── data.ts              ← market.ts 사용 중, 미사용
```

→ 총 **13개 파일** 삭제 가능

---

## 5. 기능 & UX

| # | 문제 | 위치 | 심각도 | 설명 |
|---|------|------|--------|------|
| U1 | **네비게이션 약함** | CompactNav | 중간 | 텍스트만, 액티브 인디케이터 미약 (4px 하단 바), 배경 pill 없음 |
| U2 | **테이블 가독성** | Scanner 테이블 | 중간 | 셀 간격이 넓고 정보 밀도가 낮음, zebra striping 없음 |
| U3 | **favicon 404** | index.html | 낮음 | `<link rel="icon" href="/chloes-market-daily/vite.svg" />` → 파일 없음 |
| U4 | **가상 스크롤 미적용** | NewHighTable | 낮음 | 165행 전체 DOM 렌더링 (50행 slice로 제한하고 있긴 함) |

### U1 상세: 네비게이션 비교

```
현재:
[종합] [체온계] [차트] [수급] [시장폭] [테마] [스캐너]
  ↑ 활성: accent 텍스트 + 4px 파란 하단 바 (미약)
  ↑ 비활성: tertiary 텍스트만 → 클릭 가능한지 인지 어려움

개선 방향:
[  종합  ] [ 차트 ] [ 수급 ] [ 테마 ] [ 스캐너 ]
  ↑ 활성: accent-soft 배경 pill + accent 텍스트 (Framer Motion layoutId)
  ↑ 비활성: 호버 시 subtle 배경
  ↑ 7항목 → 5항목 (체온계→종합 통합, 시장폭→수급 통합)
```

### U2 상세: 테이블 가독성

```
현재 셀 패딩: py-2.5 px-5 → 한 행 ~42px 높이
→ 480px에 ~11행만 표시

개선:
셀 패딩: py-2 px-3 → 한 행 ~36px 높이
→ 400px에 ~11행 표시 + zebra striping으로 가독성 보완
→ 가상 스크롤로 전체 데이터 접근 가능
```

---

## 6. 요약 대시보드

### 심각도별 분포

| 심각도 | 개수 | 항목 |
|--------|------|------|
| **높음** | 6 | L1, L2, I1, I2, C1, — |
| **중간** | 11 | L3, I3, I4, C2, C3, C4, Q1, Q2, Q3, U1, U2 |
| **낮음** | 4 | L4, Q4, Q5, U3, U4 |

### 카테고리별 분포

| 카테고리 | 개수 | 핵심 키워드 |
|----------|------|-------------|
| 레이아웃 | 4 | 높이 불일치, 그리드 리듬, 간격 혼재 |
| 정보 설계 | 4 | **중복 표시 (ADR×2, 수급×2, 상승비율×3)** |
| 차트 | 4 | 바 너비 2px, 텍스트 잘림, 콘솔 경고 |
| 코드 품질 | 5 | 인라인 스타일 50+곳, 코드 중복 3건 |
| UX | 4 | 네비게이션, 테이블, favicon |

### 우선순위 추천

```
1순위 (즉시 개선):
  ├─ L1+L2: 차트 높이 표준화 + 그리드 시스템 도입
  ├─ I2+I3: MarketPulse 중복 제거 (사이드바 삭제)
  └─ C1: 수급 바차트 60일→30일 기본

2순위 (구조 개선):
  ├─ Q1: fontSize 인라인 → CSS 유틸리티
  ├─ Q2: TabGroup 공통 컴포넌트
  ├─ Q3: DataTable 범용 컴포넌트
  └─ C3: Recharts 제거 → 커스텀 SVG

3순위 (마무리):
  ├─ Q4+Q5: 레거시 파일/패키지 정리
  ├─ U1: 네비게이션 Framer Motion 개선
  ├─ U3: favicon 수정
  └─ U4: 가상 스크롤 적용
```
