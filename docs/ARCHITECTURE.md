# Chloe's Market Daily — 아키텍처 문서

> 작성일: 2026-02-13 | 버전: v2.0

---

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 상세](#2-기술-스택-상세)
3. [파일 구조 전체 맵](#3-파일-구조-전체-맵)
4. [데이터 파이프라인](#4-데이터-파이프라인)
5. [현재 컴포넌트 상세 분석](#5-현재-컴포넌트-상세-분석)
6. [디자인 시스템 현황](#6-디자인-시스템-현황)

---

## 1. 프로젝트 개요

**Chloe's Market Daily**는 한국 주식 시장(KOSPI/KOSDAQ) 데일리 대시보드입니다.

| 항목 | 내용 |
|------|------|
| 배포 URL | https://chloeconciergetc-code.github.io/chloes-market-daily/ |
| 배포 방식 | GitHub Pages (main push → 자동 배포) |
| 데이터 갱신 | 매일 장 마감 후 Python 스크립트로 DB → JSON 추출 |
| 대상 사용자 | 한국 주식 시장 일일 현황을 한 눈에 파악하려는 개인 |
| 언어 | 한국어 UI |
| 테마 | 다크 모드 전용 |

**디자인 철학:** "Bloomberg Terminal meets 토스 증권" — 전문 데이터를 모던하고 깔끔한 UI로

### 컴포넌트 맵 (요약)

```
App.tsx (Layout)
├─ Header (Title + Date)
├─ CompactNav (Sticky nav with IntersectionObserver)
├─ GROUP 1: OVERVIEW
│  ├─ HeroDashboard (regime gauge 0-100 + index prices + investor flow summary)
│  └─ MarketPulse (up/down bar + ADR/volume/52w-high tiles + sidebar stats)
├─ GROUP 2: PRICE ACTION
│  ├─ IndexCandlestickChart (KOSPI) - Custom SVG + d3-scale
│  ├─ IndexCandlestickChart (KOSDAQ) - Custom SVG + d3-scale
│  └─ IndexOverlayChart (KOSPI vs KOSDAQ normalized)
├─ GROUP 3: MARKET INTERNALS
│  ├─ InvestorFlow (3-way bar chart, custom SVG)
│  └─ BreadthSection (2 Recharts AreaCharts: MA20 breakout + high/low spread)
├─ GROUP 4: THEMES
│  ├─ ThemeMomentum (table with top10/bottom10 toggle)
│  └─ SectorHeatmap (Recharts Treemap)
└─ GROUP 5: SCANNER
   ├─ NewHighTable (sortable, 50 rows)
   └─ NewLowTable (sortable, 50 rows)
```

---

## 2. 기술 스택 상세

### 2.1 핵심 의존성

| 패키지 | 버전 | 용도 | 번들 영향 |
|--------|------|------|-----------|
| react | 19.2.4 | UI 프레임워크 | 핵심 |
| react-dom | 19.2.4 | DOM 렌더링 | 핵심 |
| typescript | 5.9.3 | 타입 안전성 | 빌드 전용 |
| vite | 7.3.1 | 빌드 도구 + HMR | 빌드 전용 |
| tailwindcss | 4.1.18 | 유틸리티 CSS | 핵심 |
| recharts | 3.7.0 | Area/Treemap 차트 | **~150KB, 제거 대상** |
| d3-scale | 4.0.2 | 선형 스케일 계산 | ~5KB |
| framer-motion | 12.34.0 | 애니메이션 | **설치됨, 현재 미사용** |
| lucide-react | 0.563.0 | 아이콘 | **설치됨, 현재 미사용** |
| clsx | 2.1.1 | 조건부 className | **설치됨, 현재 미사용** |
| @tanstack/react-virtual | 3.13.18 | 가상 스크롤 | **설치됨, 현재 미사용** |

### 2.2 빌드 & 배포

```
빌드 명령: npm run build → tsc -b && vite build
출력 경로: dist/
Base URL: /chloes-market-daily/
CI/CD: .github/workflows/deploy.yml
  - Node.js v22
  - npm ci → npm run build → GitHub Pages 배포
```

### 2.3 폰트

| 폰트 | 용도 | 로딩 방식 |
|------|------|-----------|
| Pretendard Variable | 한글 본문/제목 (--font-sans) | jsdelivr CDN, dynamic subset |
| JetBrains Mono | 숫자/코드 데이터 (--font-mono) | Google Fonts |

---

## 3. 파일 구조 전체 맵

```
chloes-market-daily/
├── index.html                           ← HTML 진입점 (favicon 404 문제 있음)
├── package.json                         ← 의존성 정의
├── vite.config.ts                       ← Vite 설정 (base: /chloes-market-daily/)
├── tsconfig.json                        ← TS 설정 (부모)
├── tsconfig.app.json                    ← TS 설정 (strict, ES2022)
├── eslint.config.js                     ← ESLint
├── DESIGN-PLAN-V2.md                    ← 이전 디자인 문서 (구버전)
├── extract_data.py                      ← DB→JSON 추출 스크립트
├── .github/workflows/deploy.yml         ← GitHub Pages 배포 워크플로우
│
├── public/data/                         ← 빌드 아티팩트 (src/data/ 복사본)
│
└── src/
    ├── main.tsx                          ← React 루트 렌더
    ├── App.tsx                           ← **메인 레이아웃** (207줄)
    ├── index.css                         ← 글로벌 스타일 + 애니메이션 (137줄)
    ├── vite-env.d.ts                     ← Vite 타입
    │
    ├── styles/
    │   └── tokens.css                    ← **디자인 토큰** (114줄)
    │
    ├── types/
    │   ├── market.ts                     ← **모든 타입 정의** (107줄)
    │   └── data.ts                       ← 레거시 타입 (미사용)
    │
    ├── lib/
    │   └── format.ts                     ← 숫자 포맷 유틸 (32줄, 6함수)
    │
    ├── hooks/
    │   ├── useMarketData.ts              ← JSON import 기반 데이터 훅 (28줄)
    │   └── useData.ts                    ← fetch 기반 훅 (미사용)
    │
    ├── data/                             ← **10개 JSON 데이터 파일**
    │   ├── meta.json                     (69B)
    │   ├── market-summary.json           (934B)
    │   ├── market-regime.json            (349B)
    │   ├── index-kospi.json              (7.3KB)
    │   ├── index-kosdaq.json             (7.0KB)
    │   ├── breadth.json                  (2.7KB)
    │   ├── investor-flow.json            (4.5KB)
    │   ├── themes.json                   (6.6KB)
    │   ├── scanner-newhigh.json          (24.6KB)
    │   └── scanner-newlow.json           (2.1KB)
    │
    └── components/
        ├── **[루트 레벨 — 모두 미사용 레거시]**
        │   ├── GlassCard.tsx             ← 미사용
        │   ├── MetricCard.tsx            ← 미사용
        │   ├── SignalLight.tsx           ← ui/SignalLight.tsx와 중복
        │   ├── MiniSparkline.tsx         ← ui/Sparkline.tsx와 중복
        │   ├── CandlestickChart.tsx      ← charts/IndexCandlestickChart.tsx로 대체됨
        │   ├── BreadthChart.tsx          ← level2/BreadthChart.tsx로 대체됨
        │   └── HighLowSpread.tsx         ← 미사용
        │
        ├── ui/                           ← **디자인 시스템 프리미티브**
        │   ├── Card.tsx                  (23줄) — 3-tier 카드 래퍼
        │   ├── ChartContainer.tsx        (26줄) — 차트용 카드 래퍼
        │   ├── SectionHeader.tsx         (12줄) — 섹션 제목 + 파란 accent bar
        │   ├── DeltaBadge.tsx            (14줄) — 등락 배지 (↑/↓ + 색상)
        │   ├── SignalLight.tsx           (19줄) — 색상 신호등 점
        │   ├── Sparkline.tsx             (30줄) — 미니 인라인 차트
        │   └── GlassCard.tsx             ← deprecated, Card로 대체됨
        │
        ├── level1/                       ← **1차 대시보드 섹션**
        │   ├── HeroDashboard.tsx         (187줄) — 레짐 게이지 + 지수 + 수급 요약
        │   ├── MarketPulse.tsx           (189줄) — 체온계 + 상세지표 사이드바
        │   ├── IndexSummary.tsx          ← 미사용 (HeroDashboard로 대체)
        │   └── MarketRegime.tsx          ← 미사용 (HeroDashboard로 대체)
        │
        ├── level2/                       ← **2차 분석 섹션**
        │   ├── InvestorFlow.tsx          (148줄) — 수급 바차트 + 요약 카드
        │   ├── BreadthChart.tsx          (66줄) — Recharts AreaChart 2개
        │   ├── ThemeMomentum.tsx         (135줄) — 테마 랭킹 테이블
        │   ├── SectorHeatmap.tsx         (101줄) — Recharts Treemap 히트맵
        │   └── SectorPerformance.tsx     ← 미사용
        │
        ├── level3/                       ← **데이터 테이블**
        │   ├── NewHighTable.tsx          (81줄) — 52주 신고가 스캐너
        │   └── NewLowTable.tsx           (76줄) — 52주 신저가 스캐너
        │
        └── charts/                       ← **차트 렌더러**
            ├── IndexCandlestickChart.tsx  (154줄) — SVG+d3 캔들차트
            └── IndexOverlayChart.tsx      (105줄) — SVG+d3 오버레이 비교
```

---

## 4. 데이터 파이프라인

### 4.1 데이터 흐름

```
┌─────────────────────┐
│ PostgreSQL DB        │  kospi_etl 사용자
│ (market.daily_bars,  │  market.weekly_52_extremes,
│  market.market_caps) │  market.universe_members
└─────────┬───────────┘
          │ extract_data.py (Python, psycopg2)
          │ - SQL 쿼리 (LAG, OVER 등 윈도우 함수)
          │ - MA20/MA60 계산
          │ - 레짐 스코어 산출
          ▼
┌─────────────────────┐
│ src/data/*.json      │  10개 JSON 파일
│ public/data/*.json   │  (빌드 아티팩트)
└─────────┬───────────┘
          │ useMarketData.ts (직접 import)
          ▼
┌─────────────────────┐
│ App.tsx              │  useData<T>('파일명.json')
│   ├→ HeroDashboard  │  props로 전달
│   ├→ MarketPulse    │
│   ├→ Charts...      │
│   └→ Scanner...     │
└─────────────────────┘
```

### 4.2 데이터 파일별 상세

#### meta.json (69B)
```json
{ "buildTimestamp": "2026-...", "dataDate": "2026-02-12" }
```

#### market-regime.json (349B)
```typescript
interface MarketRegimeData {
  date: string              // "2026-02-12"
  composite: number         // 0~100 (예: 66)
  regime: string            // 'risk-on' | 'neutral-bullish' | 'neutral' | 'neutral-bearish' | 'risk-off'
  label: string             // "중립-강세"
  components: {
    adr: number             // ADR 지표 (예: 66)
    breadth: number         // MA20 돌파율 (예: 79)
    hlSpread: number        // 신고/저 스프레드 (예: 92)
    tradingValue: number    // 거래대금 (예: 48)
    foreignFlow: number     // 외국인 수급 (예: 108)
    volatility: number      // 변동성 (예: 19)
  }
  weights: Record<string, number>  // 각 컴포넌트 가중치
}
```

#### market-summary.json (934B)
```typescript
interface MarketSummary {
  date: string
  latest: {
    date: string
    up: number              // 상승 종목수 (예: 1487)
    down: number            // 하락 종목수 (예: 1001)
    flat: number            // 보합 (예: 145)
    adr: number             // Advance/Decline Ratio (예: 1.5)
    tradingValue: number    // 거래대금 조원 (예: 45.1)
  }
  sparkline: DaySummary[]   // 최근 7일 요약
  tradingValueAvg20d: number
  tradingValueRatio: number // 오늘/20일평균 비율
  signals: {
    adr: 'green' | 'yellow' | 'red'
    tradingValue: 'green' | 'yellow' | 'red'
  }
}
```

#### index-kospi.json / index-kosdaq.json (~7KB 각각)
```typescript
interface IndexChartData {
  candles: Candle[]         // 최근 60개 봉
  ma20: number[]            // 20일 이동평균
  ma60: number[]            // 60일 이동평균
}

interface Candle {
  d: string                 // "2026-02-12"
  date: string              // 동일
  o: number                 // 시가
  h: number                 // 고가
  l: number                 // 저가
  c: number                 // 종가
  v: number                 // 거래량
}
```

#### breadth.json (2.7KB)
```typescript
interface BreadthDay {
  date: string
  aboveMa20Pct: number     // 0~100 (20일선 위 종목 비율)
  newHighs: number          // 52주 신고가 종목수
  newLows: number           // 52주 신저가 종목수
  spread: number            // newHighs - newLows
}
// 최근 30일 배열
```

#### investor-flow.json (4.5KB)
```typescript
interface InvestorFlowData {
  kospi: InvestorFlowDay[]  // 최근 60일
  kosdaq: InvestorFlowDay[]
}

interface InvestorFlowDay {
  date: string
  foreign: number           // 외국인 순매수 (억원)
  institution: number       // 기관 순매수 (억원)
  individual: number        // 개인 순매수 (억원)
  otherCorp: number         // 기타법인 (억원)
}
```

#### themes.json (6.6KB)
```typescript
interface ThemesData {
  top10: ThemeItem[]        // 상승 상위 10개 테마
  bottom10?: ThemeItem[]    // 하락 상위 10개 테마
  heatmap: HeatmapItem[]    // 트리맵용 섹터 데이터
  total: number             // 전체 테마 수
}

interface ThemeItem {
  rank: number
  name: string              // "홈쇼핑", "반도체 대표주(생산)" 등
  changePercent: number     // 등락률 %
  syncRate: number          // 동조율 0~100
  stockCount: number        // 구성 종목수
  topStocks: string[]       // 대장주 목록
  prevRank?: number | null  // 전일 순위
  tradingValueConc?: number // 거래대금 집중도 %
}

interface HeatmapItem {
  name: string
  value: number             // 트리맵 면적 기준값
  change: number            // 등락률 %
}
```

#### scanner-newhigh.json (24.6KB) / scanner-newlow.json (2.1KB)
```typescript
interface ScannerStock {
  ticker: string            // 종목코드
  name: string              // "삼성전자"
  close: number             // 종가
  changePct: number         // 등락률 %
  volume: number            // 거래량
  marketCap: number         // 시가총액 (억원)
  sector: string            // "전기·전자", "금융" 등
  volRatio?: number | null  // 거래량/20일평균
}
// 신고가: ~200개, 신저가: ~14개
```

---

## 5. 현재 컴포넌트 상세 분석

### 5.1 App.tsx — 메인 레이아웃 (207줄)

**구조:**
```
<div max-w-1200 mx-auto>
  <Header />              ← 인라인 컴포넌트 (타이틀 + 날짜)
  <CompactNav />           ← 인라인 컴포넌트 (스크롤 네비게이션)

  <div mt-6>
    GROUP 1: space-y-6     ← HeroDashboard + MarketPulse
    <구분선 my-10>
    GROUP 2: space-y-4     ← 캔들차트 2개 + 오버레이
    <구분선 my-10>
    GROUP 3: space-y-6     ← InvestorFlow + BreadthSection
    <구분선 my-10>
    GROUP 4: space-y-6     ← ThemeMomentum + SectorHeatmap
    <구분선 my-10>
    GROUP 5: space-y-6     ← NewHighTable + NewLowTable
  </div>

  <Footer />               ← 인라인 컴포넌트
</div>
```

**데이터 로딩 패턴:**
- `useData<T>('파일명.json')` 호출 10회 (App.tsx:102-111)
- 각 섹션에 props로 전달
- 조건부 렌더링: `{data && <Component data={data} />}`

**네비게이션 (CompactNav, App.tsx:48-88):**
- 7개 섹션: 종합, 체온계, 차트, 수급, 시장폭, 테마, 스캐너
- `IntersectionObserver`로 현재 뷰포트 섹션 감지
- rootMargin: `-20% 0px -60% 0px`
- 액티브 상태: 텍스트 색상 변경 + 4px 하단 바

**문제점:**
- Header, CompactNav, Footer가 App.tsx 안에 인라인 정의 → 분리 필요
- 섹션 간 구분선이 인라인 `div` (`my-10 w-16 h-px`) → 일관성 없음
- 간격이 `space-y-6`, `space-y-4`, `my-10` 등 혼재

---

### 5.2 HeroDashboard (level1/HeroDashboard.tsx, 187줄)

**하위 컴포넌트:**
- `CircularGauge` (12-44줄): SVG 120x120, 원형 게이지 0~100
- `MiniIndex` (47-69줄): KOSPI/KOSDAQ 가격 + 등락 표시
- `FlowSummary` (72-98줄): 오늘 수급 요약 (외국인/기관/개인)

**레이아웃:**
```
┌────────────────────────────────────────────────────┐
│ gradient background + glow effect                   │
│ ┌──[auto: Gauge]──┬──[1fr: 우측]─────────────────┐ │
│ │ CircularGauge   │ [박스] KOSPI 5,354  +1.00%   │ │
│ │ "중립-강세"      │        KOSDAQ 1,115 -0.03%  │ │
│ │ NEUTRAL BULL    │ [박스] 오늘 수급: 외3.0조 ...│ │
│ │ 4강세 · 1약세   │ [pill] ADR 66 MA20돌파 79... │ │
│ └────────────────┴────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**스타일 특성:**
- 카드: rounded-[--radius-xl], gradient bg, elevated shadow
- 우상단 glow: 48x48 blur-3xl, opacity 20%
- 레짐별 5색 시스템: regimeConfig 객체로 color/bgColor/label/emoji 관리

**Prop 의존성:**
```typescript
{ regime: MarketRegimeData, kospi?: IndexChartData, kosdaq?: IndexChartData, investorFlow?: InvestorFlowData }
```

---

### 5.3 MarketPulse (level1/MarketPulse.tsx, 189줄)

**하위 컴포넌트:**
- `ThermometerBar` (7-26줄): 라벨 + 값 + 프로그레스 바
- `StatTile` (29-57줄): 라벨 + 큰 숫자 + 단위 + 시그널 점 + 스파크라인
- `UpDownBar` (60-86줄): 상승/하락 비율 가로 바

**레이아웃:**
```
┌──[SectionHeader: "시장 체온계"]──────────────────────────────────┐
│ ┌──[1fr: 좌측 메인]──────────────────┬──[280px: 우측 사이드바]──┐ │
│ │ [Card] UpDownBar (1487 상승 | 1001 하락) │ 상세 지표              │ │
│ │ [Grid 3col] StatTile × 3:             │ ThermometerBar × 5:    │ │
│ │   ADR 1.5 (signal+sparkline)          │   상승 비율 1487/2633 ★│ │
│ │   거래대금 45.1조 (signal+sparkline)   │   ADR 1.5            ★│ │
│ │   52주 신고가 165종목 (signal)          │   거래대금 비율 0%    ★│ │
│ │                                        │   MA20 돌파율 74.5%    │ │
│ │                                        │   신고/저 스프레드 151  │ │
│ └──────────────────────────────────────┴──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
★ = 좌측과 중복 데이터
```

**핵심 문제:**
- 좌측 StatTile의 ADR, 거래대금이 우측 ThermometerBar와 **완전히 중복**
- 상승비율: UpDownBar에서 이미 보여주는데 우측에서 또 표시
- 280px 사이드바가 정보 대비 공간을 과다 사용

---

### 5.4 IndexCandlestickChart (charts/IndexCandlestickChart.tsx, 154줄)

**구현 방식:** 순수 SVG + d3-scale
- viewBox 기반 (`0 0 600 300`), `preserveAspectRatio="xMidYMid meet"`
- 차트 영역 65%, 거래량 영역 15%, 간격 4%, 하단 여백
- candleW = `max(2, innerW / candles.length * 0.6)`
- MA 토글 버튼 (MA20: 파란색, MA60: 주황색)
- 마지막 가격 라벨 (우측 태그)
- Y축 4등분 그리드 + 날짜 라벨 (6등분)

**Prop:** `{ data: IndexChartData, label: string, width=600, height=300 }`

**문제점:**
- 기본 height=300 → KOSDAQ 차트도 300 → 오버레이는 260 → **불일치**
- margin.right=52 → Y축 라벨 공간이지만 캔들 영역을 줄임
- `vMax`를 95th percentile로 계산 (이상치 방지) → 좋은 패턴

---

### 5.5 IndexOverlayChart (charts/IndexOverlayChart.tsx, 105줄)

**구현 방식:** 순수 SVG + d3-scale
- 두 지수를 시작점=100으로 정규화하여 비교
- KOSPI: `--chart-1` (파란), KOSDAQ: `--chart-3` (주황)
- 100 기준선 표시
- 하단 요약: "KOSPI +30.9% · KOSDAQ +23.5% · 스프레드 +7.4p"

**Prop:** `{ kospi: IndexChartData, kosdaq: IndexChartData, width=600, height=260 }`

**문제점:**
- height=260 (캔들차트 300과 불일치)
- 전체 너비 사용 vs 캔들차트는 half-width → 시각적 리듬 깨짐

---

### 5.6 InvestorFlow (level2/InvestorFlow.tsx, 148줄)

**하위 컴포넌트:**
- `BarChart` (16-80줄): SVG 그룹 바차트, 3색 (외국인/기관/개인)
- `FlowCard` (82-103줄): 요약 카드 (오늘 수급 + 5일 누적)

**레이아웃:**
```
[SectionHeader: "투자자별 매매동향"]
[Card]
  [Tab: KOSPI | KOSDAQ]      ← 탭 UI (인라인 구현)
  [FlowCard × 3: 3-col grid] ← 외국인/기관/개인 요약
  [BarChart: 전체 너비]       ← 60일 바차트
```

**바차트 상세:**
- viewBox: `0 0 600 220`
- barGroupW = `innerW / data.length` (60일 → ~8px per group)
- barW = `max(2, barGroupW * 0.22)` → **~2px per bar** → 너무 좁음
- 3개 바 × 60일 = 180개 rect 렌더링
- zero-line 기준, 양/음 방향

**탭 UI 패턴 (121-130줄):**
```tsx
<button className={active ? 'bg-accent-soft text-accent' : 'text-tertiary hover:text-secondary'}>
  {m.toUpperCase()}
</button>
```
→ ThemeMomentum, Scanner에서도 거의 동일하게 반복

---

### 5.7 BreadthSection (level2/BreadthChart.tsx, 66줄)

**구현:** Recharts 기반 (프로젝트에서 **유일하게** Recharts 사용하는 곳)

**차트 2개:**
1. "20일선 위 종목 비율" — AreaChart, domain [0, 100], 기준선 30/50/70
2. "신고가-신저가 스프레드" — AreaChart, 기준선 0

**사용 Recharts 컴포넌트:**
`AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid`

**문제점:**
- `ResponsiveContainer width="100%" height="100%"` → width(-1) height(-1) 콘솔 경고 발생
- ChartContainer의 height=260 사용 → 캔들차트 300과 불일치
- tooltipStyle, tickStyle을 컴포넌트 내에 인라인 정의 → 다른 차트와 공유 안됨

---

### 5.8 ThemeMomentum (level2/ThemeMomentum.tsx, 135줄)

**하위 컴포넌트:**
- `BarFill` (6-14줄): 미니 프로그레스 바 (16px 너비)
- `ThemeTable` (16-95줄): 8컬럼 테이블

**테이블 컬럼:**
| # | 컬럼 | 너비 | 반응형 |
|---|------|------|--------|
| 1 | # (순위) | w-10 | 항상 |
| 2 | 테마명 | auto | 항상 |
| 3 | 등락률 | auto | 항상 |
| 4 | 바 차트 | w-20 | sm: 이상 |
| 5 | 동조율 | auto | 항상 |
| 6 | 거래집중 | auto | md: 이상 |
| 7 | 종목수 | auto | md: 이상 |
| 8 | 대장주 | auto | lg: 이상 |

**탭 UI (108-129줄):** 상승 TOP 10 / 하락 TOP 10
→ InvestorFlow의 탭과 동일 패턴, 별도 구현

---

### 5.9 SectorHeatmap (level2/SectorHeatmap.tsx, 101줄)

**구현:** Recharts Treemap + 커스텀 셀 렌더러

**CustomCell 로직 (35-74줄):**
- 셀 크기 < 20x16px → 렌더링 안함
- 셀 크기 < 44x26px → 텍스트 없음 (색상만)
- 셀 크기 < 52x36px → 이름만 (등락률 숨김)
- 이름 길이 > 12/7자 → slice + '…'
- 색상: 초록(상승), 빨강(하락), intensity = `min(1, abs(change)/4)`

**호버 툴팁:** fixed 포지션, 마우스 좌표 기반

**문제점:**
- 작은 셀에서 텍스트 잘림/겹침
- ResponsiveContainer 경고 발생
- 340px 고정 높이 → 데이터량에 따라 셀이 너무 작아질 수 있음

---

### 5.10 NewHighTable / NewLowTable (level3/, 81/76줄)

**두 컴포넌트 비교:**
| 항목 | NewHighTable | NewLowTable |
|------|-------------|-------------|
| 줄 수 | 81 | 76 |
| 정렬 기본값 | marketCap (내림) | marketCap (내림) |
| 정렬 방향 changePct | **내림 (높은 순)** | **오름 (낮은 순)** |
| SortButton | 별도 컴포넌트 추출 | **인라인 구현** |
| 나머지 로직 | 동일 | 동일 |

→ **90% 이상 동일 코드**, 정렬 방향만 다름
→ 하나의 범용 컴포넌트로 통합 필요

**테이블 컬럼:**
| 컬럼 | 정렬 | 반응형 |
|------|------|--------|
| 종목명 + 섹터 | — | 항상 |
| 종가 | — | 항상 |
| 등락률 | 가능 | 항상 |
| 시총 | 가능 | md: 이상 |
| 거래금액 | 가능 | lg: 이상 |

**스크롤:** `max-h-[480px] overflow-y-auto` + sticky thead
**렌더링:** `sorted.slice(0, 50)` → 최대 50행 표시
**가상 스크롤:** 미사용 (@tanstack/react-virtual 설치되어 있으나)

---

### 5.11 UI 프리미티브 컴포넌트 상세

#### Card.tsx (23줄)
```typescript
type CardTier = 'ambient' | 'standard' | 'elevated'
Props: { children, className, noPad, tier='standard' }
```
- ambient: 투명 배경, 기본 border
- standard: bg-card, shadow-card, hover border 변경
- elevated: bg-card, shadow-elevated, 더 밝은 border

#### ChartContainer.tsx (26줄)
```typescript
Props: { title, subtitle?, height=260, actions?, children }
```
- Card로 감싸고, 상단에 title/subtitle/actions
- 하단에 `div` height 고정

#### SectionHeader.tsx (12줄)
```typescript
Props: { title, subtitle?, icon?(미사용), delay?(미사용) }
```
- 파란 accent bar (1×5 rounded-full) + 제목 + 부제

#### DeltaBadge.tsx (14줄)
- 값에 따라 ↑/↓ + 색상 배경 + font-mono

#### SignalLight.tsx (19줄)
- green/yellow/red 원형 점 + box-shadow glow
- sm: 1.5×1.5, md: 2×2

#### Sparkline.tsx (30줄)
- SVG polyline, 마지막 점에 circle 표시
- 자동 min/max 스케일링

---

## 6. 디자인 시스템 현황

### 6.1 색상 체계 (tokens.css)

**배경 계층 (5단계):**
```
--bg-base:      #0a0d14     가장 어두운 배경
--bg-surface:   #111622     카드 내부 요소 배경
--bg-card:      #151b2b     카드 배경
--bg-card-hover:#1a2238     카드 호버
--bg-elevated:  rgba(255,255,255,0.05)  강조 배경
```

**텍스트 계층 (4단계, WCAG AA 준수):**
```
--text-primary:   rgba(255,255,255,0.95)  기본
--text-secondary: rgba(255,255,255,0.65)  보조
--text-tertiary:  rgba(255,255,255,0.42)  3차
--text-muted:     rgba(255,255,255,0.24)  희미
```

**시맨틱 색상:**
```
상승: --color-up: #22c55e    (green-500)
하락: --color-down: #ef4444  (red-500)
보합: --color-flat: rgba(255,255,255,0.30)
액센트: --color-accent: #6366f1 (indigo-500)
```

**차트 팔레트 (5색):**
```
--chart-1: #3b82f6  파란 (KOSPI, MA20)
--chart-2: #a855f7  보라 (기관 수급)
--chart-3: #f97316  주황 (KOSDAQ, MA60, 개인)
--chart-4: #06b6d4  시안 (거래량)
--chart-5: #eab308  노랑 (피크)
```

**레짐 그라디언트 (5단계):**
```
--regime-1: #22c55e  Risk-On
--regime-2: #84cc16  Neutral-Bullish
--regime-3: #eab308  Neutral
--regime-4: #f97316  Neutral-Bearish
--regime-5: #ef4444  Risk-Off
```

### 6.2 타이포그래피 (7단계 스케일)

```
--text-hero:     2.25rem  (36px) — 레짐 스코어 숫자
--text-display:  1.75rem  (28px) — 페이지 제목, StatTile 큰 숫자
--text-headline: 1.125rem (18px) — 섹션 제목
--text-title:    0.9375rem(15px) — 카드 제목, 강조 텍스트
--text-body:     0.8125rem(13px) — 본문, 테이블 셀
--text-caption:  0.75rem  (12px) — 레이블, 보조 정보
--text-micro:    0.6875rem(11px) — 타임스탬프, 각주
```

**문제:** 모든 컴포넌트에서 `style={{ fontSize: 'var(--text-body)' }}` 형태로 인라인 사용 (50+ 곳)
→ CSS 유틸리티 클래스로 변환 필요

### 6.3 간격 시스템

```
--space-1:  4px   --space-6:  24px
--space-2:  8px   --space-8:  32px
--space-3:  12px  --space-10: 40px
--space-4:  16px  --space-12: 48px
--space-5:  20px
```

### 6.4 보더 반경 (6단계)

```
--radius-xs:   4px    --radius-lg:   14px
--radius-sm:   6px    --radius-xl:   20px
--radius-md:   10px   --radius-full: 9999px
```

### 6.5 그림자 (3단계)

```
--shadow-ambient:  0 0 0 1px border                    (테두리만)
--shadow-card:     0 1px 3px rgba(0,0,0,0.25) + border (가벼운 그림자)
--shadow-elevated: 0 8px 32px rgba(0,0,0,0.45) + border(깊은 그림자)
```

### 6.6 애니메이션 (index.css)

| 클래스 | 효과 | 시간 |
|--------|------|------|
| `.animate-fade-in` | 아래→위 페이드인 | 0.4s |
| `.animate-pulse-glow` | 투명도 맥동 | 2s infinite |
| `.animate-count-up` | 아래→위 숫자 등장 | 0.6s |
| `.animate-shimmer` | 로딩 시머 | 2s infinite |
| `.stagger > *` | 자식 순차 등장 | 50ms 간격, 최대 8개 |
