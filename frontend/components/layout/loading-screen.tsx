export function LoadingScreen() {
  return (
    <div
      className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12"
      role="status"
      aria-live="polite"
      aria-label="Restoring your session"
    >
      <div className="h-14 w-full animate-pulse rounded-full border border-border/60 bg-card/60" />

      <main className="space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-muted/70" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-border/70 bg-card/60"
            >
              <div className="aspect-video animate-pulse bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-lg bg-muted/70" />
                <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <span className="sr-only">Restoring your session…</span>
    </div>
  );
}
