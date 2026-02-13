# Chloe's Market Daily — Design Redesign Plan v2
> Phase 1~3 반영 최신 버전 | 2026-02-13

## Current State
- **Tech:** React 19 + Vite 7 + Tailwind 4 + Recharts + D3 + Framer Motion
- **Components:** 17 (UI 5, Level1 3, Level2 5, Level3 2, Charts 2)
- **Lines:** ~1,338 (components only)

## Philosophy
> "Bloomberg Terminal meets 토스 증권"

## Stage 1: Layout Surgery (2-3h)
- Hero Dashboard: regime gauge + index summary + investor flow summary
- Sections 10→8 (tab consolidation)
- 3-tier responsive grid (mobile 1col / tablet 2col / desktop 3col+sidebar)

## Stage 2: Visual System (2-3h)
- Color: keep up/down, add 5-color chart palette + 5-stage regime gradient
- Typography: 5-level system (Hero→Caption)
- Cards: 3-tier (Ambient/Standard/Elevated)
- Micro-interactions: countUp, hover lift, signal pulse, crosshair tooltip

## Stage 3: Component Refactoring (3-4h)
- ChartContainer wrapper + Crosshair + D3 utils
- New: HeroDashboard, CompactNav, PulseAndFlow, SectorTab, Scanner
- Perf: React.lazy, useMemo, IntersectionObserver viewport rendering

## Stage 4: Polish (1-2h)
- A11y, PWA prep, Lighthouse 90+, mobile Safari compat

## Timeline: 8-12 hours total
