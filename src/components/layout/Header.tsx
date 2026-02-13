export function Header({ date }: { date?: string }) {
  return (
    <header className="text-center mb-6 pt-6">
      <h1 className="font-bold tracking-tight text-[var(--text-primary)] fs-display">
        Chloe's Market Daily
      </h1>
      {date && (
        <p className="text-[var(--text-secondary)] font-mono mt-1.5 fs-caption">
          {date} · 15:30 장마감 기준
        </p>
      )}
      {!date && (
        <p className="text-[var(--text-muted)] font-mono mt-1.5 fs-caption">
          데이터 로딩 중...
        </p>
      )}
    </header>
  )
}
