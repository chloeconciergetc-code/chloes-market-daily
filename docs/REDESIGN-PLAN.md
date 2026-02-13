# Chloe's Market Daily — 리디자인 계획서

> 작성일: 2026-02-13 | 버전: v3.0 (완전 재작성)

---

## 목차
1. [Phase 1: Foundation](#1-phase-1-foundation)
2. [Phase 2: Layout Shell](#2-phase-2-layout-shell)
3. [Phase 3: Section Rebuilds](#3-phase-3-section-rebuilds)
4. [Phase 4: Polish](#4-phase-4-polish)
5. [변경 파일 전체 목록](#5-변경-파일-전체-목록)
6. [검증 방법](#6-검증-방법)

---

## 1. Phase 1: Foundation

> 목표: 디자인 토큰 확장, 새 프리미티브 생성, 불필요 파일 정리

### 1.1 레거시 파일 삭제

App.tsx에서 import되지 않는 파일 확인 후 삭제:
```
삭제 대상:
├── src/components/GlassCard.tsx        ← 미사용
├── src/components/MetricCard.tsx       ← 미사용
├── src/components/SignalLight.tsx      ← ui/SignalLight.tsx 중복
├── src/components/MiniSparkline.tsx    ← ui/Sparkline.tsx 중복
├── src/components/CandlestickChart.tsx ← charts/ 버전으로 대체됨
├── src/components/BreadthChart.tsx     ← level2/ 버전으로 대체됨
├── src/components/HighLowSpread.tsx    ← 미사용
├── src/components/ui/GlassCard.tsx     ← deprecated
├── src/components/level1/IndexSummary.tsx   ← 미사용
├── src/components/level1/MarketRegime.tsx   ← 미사용
├── src/components/level2/SectorPerformance.tsx ← 미사용
├── src/hooks/useData.ts               ← 미사용 (useMarketData.ts 사용 중)
├── src/types/data.ts                  ← 미사용 (market.ts 사용 중)
```

### 1.2 디자인 토큰 확장

**파일: `src/styles/tokens.css`에 추가:**

```css
/* ── Layout ── */
--content-max: 1200px;
--grid-gap: 16px;
--section-gap: 48px;
--nav-height: 44px;

/* ── Table ── */
--bg-row-alt: rgba(255, 255, 255, 0.015);
--bg-row-hover: rgba(255, 255, 255, 0.025);

/* ── Chart Heights (표준화) ── */
--chart-height-lg: 280px;    /* 캔들차트 등 주요 차트 */
--chart-height-md: 240px;    /* 오버레이, Breadth 등 보조 차트 */
--chart-height-heatmap: 360px;
```

### 1.3 타이포그래피 유틸리티 클래스

**파일: `src/index.css`에 추가:**

```css
/* ── Typography Utilities ── */
.text-hero     { font-size: var(--text-hero); }
.text-display  { font-size: var(--text-display); }
.text-headline { font-size: var(--text-headline); }
.text-title    { font-size: var(--text-title); }
.text-body     { font-size: var(--text-body); }
.text-caption  { font-size: var(--text-caption); }
.text-micro    { font-size: var(--text-micro); }

/* ── Semantic Background Utilities ── */
.bg-up-soft   { background: var(--color-up-soft); }
.bg-down-soft { background: var(--color-down-soft); }
```

→ 이후 모든 컴포넌트에서 `style={{ fontSize: 'var(--text-body)' }}` → `className="text-body"`로 교체

### 1.4 차트 스타일 상수 통일

**새 파일: `src/lib/chartStyles.ts`**

```typescript
export const CHART = {
  margin: { top: 16, right: 48, bottom: 24, left: 48 },
  grid: {
    stroke: 'rgba(255,255,255,0.03)',
    dasharray: '2 4',
  },
  axis: {
    fill: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
  },
  tooltip: {
    bg: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    radius: 'var(--radius-md)',
    shadow: 'var(--shadow-elevated)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    padding: '8px 12px',
  },
  refLine: {
    stroke: 'rgba(255,255,255,0.08)',
    strokeWidth: 1,
    dasharray: '4 4',
  },
  colors: {
    kospi: 'var(--chart-1)',   // #3b82f6
    kosdaq: 'var(--chart-3)',  // #f97316
    foreign: 'var(--chart-1)', // #3b82f6
    institution: 'var(--chart-2)', // #a855f7
    individual: 'var(--chart-3)',  // #f97316
    ma20: 'var(--color-ma20)',
    ma60: 'var(--color-ma60)',
  },
} as const
```

### 1.5 새 UI 프리미티브

#### TabGroup.tsx — 재사용 탭 토글

```typescript
interface TabGroupProps<T extends string> {
  tabs: { key: T; label: string; count?: number }[]
  active: T
  onChange: (key: T) => void
  variant?: 'default' | 'colored'  // colored = green/red 테마별
}
```

현재 3곳에서 중복 구현된 탭 UI를 통합:
- InvestorFlow.tsx:121-130 (KOSPI/KOSDAQ 토글)
- ThemeMomentum.tsx:108-129 (상승/하락 토글)
- NewHighTable.tsx:10-20 (정렬 버튼, 유사 패턴)

#### StatCard.tsx — 통계 카드 (MarketPulse StatTile 추출)

```typescript
interface StatCardProps {
  label: string
  value: string
  unit?: string
  signal?: 'green' | 'yellow' | 'red'
  sparkData?: number[]
  sparkColor?: string
  compact?: boolean
}
```

현재 MarketPulse.tsx:29-57의 StatTile을 독립 컴포넌트로 추출

#### DataTable.tsx — 범용 정렬+가상스크롤 테이블

```typescript
interface Column<T> {
  key: keyof T
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string
  render?: (value: T[keyof T], row: T) => ReactNode
  sortable?: boolean
  hideBelow?: 'sm' | 'md' | 'lg'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  defaultSort?: { key: keyof T; desc: boolean }
  maxHeight?: number
  rowKey: keyof T
  dense?: boolean
}
```

- @tanstack/react-virtual 활용 (이미 설치됨)
- NewHighTable + NewLowTable 코드 통합
- sticky header, 정렬, 반응형 컬럼 숨김, zebra striping

#### SectionWrapper.tsx — 일관된 섹션 래퍼

```typescript
interface SectionWrapperProps {
  id: string       // 네비게이션 스크롤 타겟
  children: ReactNode
  className?: string
}
// → <section id={id} className="scroll-mt-14">{children}</section>
```

### 1.6 파비콘 수정

SVG 파비콘 생성 (문자 "C", accent 색상) → index.html 업데이트
현재: `<link rel="icon" href="/chloes-market-daily/vite.svg" />` → 404

---

## 2. Phase 2: Layout Shell

> 목표: 레이아웃 컴포넌트 분리, 네비게이션 개선, 12-column 그리드 도입

### 2.1 레이아웃 컴포넌트 추출

현재 App.tsx에 인라인으로 정의된 Header, CompactNav, Footer를 분리:

```
새 파일:
├── src/components/layout/Header.tsx     ← App.tsx:17-35 추출
├── src/components/layout/StickyNav.tsx  ← App.tsx:38-88 재작성
└── src/components/layout/Footer.tsx     ← App.tsx:91-98 추출
```

### 2.2 네비게이션 재설계

**현재 (7개 항목):**
종합 | 체온계 | 차트 | 수급 | 시장폭 | 테마 | 스캐너

**개선 (5개 항목):**
종합 | 차트 | 수급 | 테마 | 스캐너

- "체온계" → "종합"에 통합 (MarketPulse를 종합 섹션 하위로)
- "시장폭" → "수급"에 통합 (Breadth를 수급 섹션 하위로)

**Framer Motion 활용:**
```tsx
// 슬라이딩 액티브 인디케이터
{active === item.id && (
  <motion.div
    layoutId="nav-active-pill"
    className="absolute inset-0 rounded-lg bg-[var(--color-accent-soft)]"
    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
  />
)}
```

**스타일 스펙:**
- 높이: 44px
- 배경: `rgba(10, 13, 20, 0.95)` + `backdrop-blur-xl`
- 아이템: `px-4 py-2`, `text-caption` (12px), `font-semibold`
- 액티브: `--color-accent-soft` 배경 pill, `--color-accent` 텍스트
- 아이템 간 간격: 4px

**IntersectionObserver 추출:**
새 파일: `src/hooks/useActiveSection.ts`

### 2.3 App.tsx 재구축

**현재의 문제:**
```tsx
// 현재: 비일관적 간격, 인라인 구분선
<div className="space-y-6">...</div>
<div className="my-10 w-16 h-px bg-..." />  // 수동 구분선
<div className="space-y-4">...</div>        // 다른 간격!
```

**개선:**
```tsx
// 개선: 일관된 SectionWrapper + section-gap
<div className="max-w-[var(--content-max)] mx-auto px-4 md:px-6 lg:px-8">
  <Header date={meta?.dataDate} />
  <StickyNav />

  <main className="flex flex-col" style={{ gap: 'var(--section-gap)' }}>
    <SectionWrapper id="overview">
      <RegimeOverview ... />    {/* 게이지 + 지수 + 핵심 지표 */}
    </SectionWrapper>

    <SectionWrapper id="charts">
      <PriceCharts ... />       {/* 캔들 2개 + 오버레이 */}
    </SectionWrapper>

    <SectionWrapper id="flow">
      <InvestorFlow ... />      {/* 수급 바차트 */}
      <BreadthCharts ... />     {/* MA20 돌파 + 스프레드 */}
    </SectionWrapper>

    <SectionWrapper id="themes">
      <ThemeSection ... />      {/* 테마 테이블 + 히트맵 */}
    </SectionWrapper>

    <SectionWrapper id="scanner">
      <ScannerSection ... />    {/* 신고가 + 신저가 통합 */}
    </SectionWrapper>
  </main>

  <Footer />
</div>
```

---

## 3. Phase 3: Section Rebuilds

> 목표: 각 섹션을 완전히 재구축. 위에서 아래로, 한 섹션씩.

### 3.1 종합 섹션 — RegimeOverview + MarketPulse 통합

**현재 구조 (2개 컴포넌트, 정보 중복):**
```
HeroDashboard: 게이지 + 지수 + 수급 + pills
MarketPulse:   상승/하락 + StatTile×3 + ThermometerBar×5 (중복!)
```

**개선 구조 (하나의 통합된 Overview):**
```
Desktop (>=1024px):
┌────[4col]─────────┬────[8col]──────────────────────────────┐
│                    │                                         │
│  ○ CircularGauge   │  KOSPI  5,354.49   ↑ +52.8 (+1.00%)   │
│     66 /100        │  KOSDAQ 1,114.87   ↓ -0.33 (-0.03%)   │
│                    │                                         │
│  중립-강세          │  ┌───[상승/하락 바: 전체 너비]──────────┐ │
│  🟡 NEUTRAL BULL   │  │ 1487 상승 ████████████ 1001 하락  │ │
│                    │  └──────────────────────────────────────┘ │
│  4 강세 · 1 약세   │                                         │
│                    │  ┌──[ADR]──┬──[거래대금]──┬──[MA20돌파]──┐ │
│  [Component Pills] │  │ 1.5    │ 45.1 조원  │ 74.5%       │ │
│  ADR 66            │  │ signal │ sparkline  │             │ │
│  MA20돌파 79       │  └────────┴────────────┴──────────────┘ │
│  신고/저 92        │                                         │
│  ...               │                                         │
└────────────────────┴──────────────────────────────────────────┘
```

**핵심 변경사항:**
- MarketPulse 우측 사이드바(ThermometerBar×5) **완전 삭제** → 중복 제거
- HeroDashboard의 FlowSummary 제거 → 수급 섹션으로 이동
- UpDownBar + StatCard×3~4 = MarketPulse 좌측만 유지
- 결과: 정보 중복 0, 시선 집중도 향상

**사용할 기존 코드:**
- CircularGauge (HeroDashboard.tsx:12-44) → 그대로 재사용
- MiniIndex (HeroDashboard.tsx:47-69) → 그대로 재사용
- UpDownBar (MarketPulse.tsx:60-86) → 그대로 재사용
- StatTile → 새 StatCard로 교체

---

### 3.2 차트 섹션 — PriceCharts

**현재 구조:**
```
[lg:grid-cols-2]
  KOSPI 캔들 (600×300)  |  KOSDAQ 캔들 (600×300)
[mt-4, 전체 너비]
  오버레이 (600×260)
```

**개선 구조:**
```
Desktop:
┌──[6col: KOSPI 캔들]──────┬──[6col: KOSDAQ 캔들]─────────┐
│  height: 280px (통일)     │  height: 280px (통일)         │
│  width: auto (responsive) │  width: auto (responsive)     │
├──[8col: 오버레이]──────────┬──[4col: 기간 수익률 요약]────┤
│  height: 240px             │  KOSPI: +30.9%                │
│  KOSPI vs KOSDAQ 비교      │  KOSDAQ: +23.5%               │
│                            │  스프레드: +7.4p              │
│                            │  (기존 하단 텍스트를 카드로)  │
└────────────────────────────┴──────────────────────────────┘
```

**핵심 변경사항:**
- 캔들차트 height: 300 → 280으로 통일
- 오버레이 height: 260 → 240으로 변경
- 오버레이 하단 요약 텍스트 → 우측 4col 카드로 분리
- 모든 차트 `CHART.margin` 상수 사용

---

### 3.3 수급 섹션 — InvestorFlow + Breadth 통합

**현재 구조:**
```
섹션 "수급": InvestorFlow (전체 너비)
섹션 "시장폭": BreadthSection (2-col grid)
```

**개선 구조:**
```
┌──[12col: 투자자별 매매동향]───────────────────────────────┐
│  [TabGroup: KOSPI | KOSDAQ]                                │
│  ┌──[FlowCard: 외국인]──┬──[기관]──────┬──[개인]────────┐ │
│  │  +3.0조, 5일 +1.1조  │ +1.4조      │ -4.5조         │ │
│  └─────────────────────┴─────────────┴─────────────────┘ │
│  [BarChart: 30일(기본), height: 240px]                    │
│  ※ 60일→30일로 축소: barW ~4px (가독성 2배 개선)          │
└──────────────────────────────────────────────────────────┘

┌──[6col: MA20 돌파율]───────┬──[6col: 신고저 스프레드]────┐
│  height: 240px              │  height: 240px              │
│  커스텀 SVG AreaChart       │  커스텀 SVG AreaChart       │
│  (Recharts 제거)            │  (Recharts 제거)            │
└────────────────────────────┴────────────────────────────┘
```

**핵심 변경사항:**
- 수급 바차트: `data.slice(-30)` 기본 → 바 너비 2배 증가
- **Recharts AreaChart → 커스텀 SVG+d3-scale AreaChart로 교체**
  - 새 파일: `src/components/charts/AreaChart.tsx`
  - SVG `<path>` (선) + `<path>` (그라디언트 fill)
  - `<linearGradient>` (현재 Recharts에서 사용하는 것과 동일한 효과)
  - `<line>` (기준선: 30%, 50%, 70%, 0)
  - `<text>` (축 라벨)
  - 기존 캔들차트 패턴 재활용
- **Recharts Treemap → 커스텀 TreemapChart로 교체** (테마 섹션)
- `ResponsiveContainer` 제거 → 콘솔 경고 해결

---

### 3.4 테마 섹션 — ThemeSection

**현재 구조:**
```
ThemeMomentum: 테이블 (8컬럼, 인라인 탭)
SectorHeatmap: Recharts Treemap (340px)
```

**개선 구조:**
```
┌──[12col: 주도 테마]──────────────────────────────────────┐
│  [TabGroup: 🚀 상승 TOP 10 | 📉 하락 TOP 10]            │
│  테이블: BarFill 미니차트 제거, 패딩 축소, zebra striping │
│  컬럼: # | 테마명 | 등락률 | 동조율 | 대장주(2개)        │
└──────────────────────────────────────────────────────────┘

┌──[12col: 테마 히트맵]────────────────────────────────────┐
│  height: 360px (340→360 증가)                             │
│  커스텀 TreemapChart (Recharts Treemap 대체)              │
│  최소 셀 면적: 60×40px → 미달 시 "기타" 그룹으로 병합    │
│  모든 셀에 호버 툴팁 (현재: 작은 셀 호버 불가)           │
└──────────────────────────────────────────────────────────┘
```

**핵심 변경사항:**
- ThemeMomentum: BarFill 컬럼 제거 (시각적 노이즈)
- ThemeMomentum: 대장주 2개만 표시, 항상 visible (lg: 제한 제거)
- ThemeMomentum: 거래집중/종목수 → md: 유지
- SectorHeatmap: Recharts 제거 → 커스텀 squarify 알고리즘
  - 새 파일: `src/lib/squarify.ts` (트리맵 레이아웃 계산)
  - 새 파일: `src/components/charts/TreemapChart.tsx`
- SectorHeatmap: 작은 셀 처리 개선

---

### 3.5 스캐너 섹션 — ScannerSection (통합)

**현재 구조:**
```
NewHighTable (81줄) ← 별도 파일, SortButton 추출
NewLowTable (76줄)  ← 별도 파일, SortButton 인라인
90%+ 코드 중복
```

**개선 구조:**
```
┌──[12col: 52주 스캐너]────────────────────────────────────┐
│  [TabGroup: 신고가 (165) | 신저가 (14)]                   │
│  [DataTable]                                               │
│    - @tanstack/react-virtual 가상 스크롤                  │
│    - 행 높이: 36px (현재 ~42px)                           │
│    - 셀 패딩: py-2 px-3 (현재 py-2.5 px-5)               │
│    - 짝수행: bg-row-alt                                    │
│    - 호버: bg-row-hover, 150ms transition                 │
│    - 정렬: 테이블 헤더 클릭으로 통합                      │
│    - 반응형: 시총(md:), 거래금액(lg:) 숨김                │
│    - maxHeight: 400px                                      │
│  [/DataTable]                                              │
└──────────────────────────────────────────────────────────┘
```

**핵심 변경사항:**
- 2개 파일 → 1개 ScannerSection + DataTable 범용 컴포넌트
- TabGroup으로 신고가/신저가 전환
- 정렬: SortButton 대신 DataTable 헤더 클릭
- 행 높이/패딩 축소 → 동일 높이에 더 많은 정보
- 50행 제한 → @tanstack/react-virtual로 전체 데이터 표시 가능

---

## 4. Phase 4: Polish

### 4.1 Framer Motion 애니메이션

**섹션 스크롤 진입:**
```tsx
<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-10%' }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
```

**탭 전환:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.2 }}
  >
```

**레짐 게이지 카운트:**
```tsx
const count = useMotionValue(0)
const rounded = useTransform(count, v => Math.round(v))
useEffect(() => {
  animate(count, composite, { duration: 1.2, ease: 'easeOut' })
}, [composite])
```

**네비게이션 액티브 pill:** `layoutId` 기반 (2.2 참조)

### 4.2 반응형 테스트

| 브레이크포인트 | 너비 | 그리드 | 동작 |
|-------------|------|--------|------|
| 모바일 | <768px | 1열 | 모든 것 스택, 테이블 가로 스크롤 |
| 태블릿 | 768-1023px | 1-2열 혼합 | 차트 1열 스택, 나머지 2열 |
| 데스크톱 | >=1024px | 12-col grid | 풀 레이아웃 |

테스트 디바이스:
- iPhone SE (375px)
- iPad (768px)
- Laptop (1024px)
- Desktop (1440px)

### 4.3 접근성

- `aria-label` 모든 interactive 요소에 추가
- `role="navigation"` + `aria-current="true"` 네비게이션
- 색상 대비 확인 (현재 토큰이 WCAG AA 준수로 설계됨)
- `focus-visible` 스타일 확인 (이미 index.css에 정의됨)
- `prefers-reduced-motion` 대응 (이미 index.css에 정의됨)

### 4.4 성능 & 번들 최적화

- `recharts` 패키지 제거 → ~150KB 절감
- `framer-motion` 활용 (이미 설치됨, tree-shaking 확인)
- `@tanstack/react-virtual` 활용 (이미 설치됨)
- `clsx` 활용 가능 (이미 설치됨)
- `lucide-react` 필요 시 활용, 아니면 제거

### 4.5 최종 정리

- 모든 인라인 `style={{ fontSize }}` → CSS 클래스로 교체
- 미사용 import 제거
- `tsc -b` 타입 에러 0건 확인
- `vite build` 빌드 성공 확인
- GitHub Pages 배포 테스트

---

## 5. 변경 파일 전체 목록

### 5.1 새로 생성하는 파일

| 파일 | 용도 |
|------|------|
| `src/components/ui/TabGroup.tsx` | 재사용 탭 토글 |
| `src/components/ui/StatCard.tsx` | 통계 카드 |
| `src/components/ui/DataTable.tsx` | 범용 정렬+가상스크롤 테이블 |
| `src/components/layout/Header.tsx` | 헤더 (App.tsx에서 추출) |
| `src/components/layout/StickyNav.tsx` | Framer Motion 네비게이션 |
| `src/components/layout/Footer.tsx` | 푸터 (App.tsx에서 추출) |
| `src/components/layout/SectionWrapper.tsx` | 섹션 래퍼 |
| `src/components/charts/AreaChart.tsx` | 커스텀 SVG 영역 차트 (Recharts 대체) |
| `src/components/charts/TreemapChart.tsx` | 커스텀 SVG 트리맵 (Recharts 대체) |
| `src/components/charts/FlowBarChart.tsx` | 수급 바차트 (InvestorFlow에서 추출) |
| `src/components/sections/RegimeOverview.tsx` | 종합 섹션 (HeroDashboard 재설계) |
| `src/components/sections/MarketPulse.tsx` | 시장 지표 (중복 제거) |
| `src/components/sections/PriceCharts.tsx` | 차트 그룹 |
| `src/components/sections/InvestorFlow.tsx` | 수급 (30일 기본) |
| `src/components/sections/BreadthCharts.tsx` | 시장폭 (커스텀 SVG) |
| `src/components/sections/ThemeSection.tsx` | 테마+히트맵 통합 |
| `src/components/sections/ScannerSection.tsx` | 신고가+신저가 통합 |
| `src/lib/chartStyles.ts` | 차트 스타일 상수 |
| `src/lib/squarify.ts` | 트리맵 레이아웃 알고리즘 |
| `src/hooks/useActiveSection.ts` | IntersectionObserver 훅 |
| `public/favicon.svg` | SVG 파비콘 |

### 5.2 수정하는 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/App.tsx` | 레이아웃 완전 재작성 |
| `src/styles/tokens.css` | 레이아웃/차트/테이블 토큰 추가 |
| `src/index.css` | 타이포그래피 유틸리티 클래스 추가 |
| `src/components/ui/Card.tsx` | 'hero', 'flush' tier 추가 |
| `src/components/ui/ChartContainer.tsx` | 표준화된 height 시스템 |
| `src/components/charts/IndexCandlestickChart.tsx` | height=280, CHART 상수 사용 |
| `src/components/charts/IndexOverlayChart.tsx` | height=240, CHART 상수 사용 |
| `index.html` | 파비콘 경로 수정 |
| `package.json` | recharts 제거 |

### 5.3 삭제하는 파일

| 파일 | 이유 |
|------|------|
| `src/components/GlassCard.tsx` | 미사용 레거시 |
| `src/components/MetricCard.tsx` | 미사용 |
| `src/components/SignalLight.tsx` | ui/ 버전과 중복 |
| `src/components/MiniSparkline.tsx` | ui/ 버전과 중복 |
| `src/components/CandlestickChart.tsx` | charts/ 버전으로 대체됨 |
| `src/components/BreadthChart.tsx` | level2/ 버전으로 대체됨 |
| `src/components/HighLowSpread.tsx` | 미사용 |
| `src/components/ui/GlassCard.tsx` | deprecated |
| `src/components/level1/IndexSummary.tsx` | 미사용 |
| `src/components/level1/MarketRegime.tsx` | 미사용 |
| `src/components/level2/SectorPerformance.tsx` | 미사용 |
| `src/hooks/useData.ts` | 미사용 |
| `src/types/data.ts` | 미사용 |
| `src/components/level1/HeroDashboard.tsx` | sections/RegimeOverview로 대체 |
| `src/components/level1/MarketPulse.tsx` | sections/MarketPulse로 대체 |
| `src/components/level2/InvestorFlow.tsx` | sections/InvestorFlow로 대체 |
| `src/components/level2/BreadthChart.tsx` | sections/BreadthCharts로 대체 |
| `src/components/level2/ThemeMomentum.tsx` | sections/ThemeSection으로 대체 |
| `src/components/level2/SectorHeatmap.tsx` | sections/ThemeSection으로 대체 |
| `src/components/level3/NewHighTable.tsx` | sections/ScannerSection으로 대체 |
| `src/components/level3/NewLowTable.tsx` | sections/ScannerSection으로 대체 |

---

## 6. 검증 방법

### 6.1 빌드 검증
```bash
npm run dev                    # 로컬 개발 서버 실행
npm run build                  # tsc -b && vite build 성공 확인
```

### 6.2 기능 검증

| 항목 | 확인 방법 |
|------|-----------|
| 모든 섹션 렌더링 | 페이지 스크롤하며 5개 섹션 모두 표시 확인 |
| 네비게이션 | 각 네비 버튼 클릭 → 해당 섹션 스크롤 확인 |
| 탭 전환 | InvestorFlow(KOSPI/KOSDAQ), Theme(상승/하락), Scanner(신고가/신저가) |
| 정렬 | Scanner 테이블 헤더 클릭 → 정렬 확인 |
| 차트 상호작용 | 캔들차트 MA 토글, 히트맵 호버 툴팁 |
| 콘솔 에러 0건 | DevTools Console 확인 (Recharts 경고, favicon 404 해소) |

### 6.3 반응형 검증
```
Chrome DevTools → Device Toolbar
- 375px (모바일): 1열 스택, 테이블 가로 스크롤
- 768px (태블릿): 혼합 레이아웃
- 1024px (데스크톱): 12-col 풀 레이아웃
- 1440px (와이드): max-w-1200 센터 정렬
```

### 6.4 배포 검증
```bash
git add . && git commit -m "Redesign v3.0"
git push origin main
# GitHub Actions 워크플로우 성공 확인
# https://chloeconciergetc-code.github.io/chloes-market-daily/ 접속 확인
```
