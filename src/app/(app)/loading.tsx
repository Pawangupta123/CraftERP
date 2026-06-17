/**
 * Instant loading skeleton — shown the moment you click any nav link, while the
 * page's data streams in from the server. Keeps the sidebar/header interactive
 * so navigation never feels frozen. Next.js wraps the page in <Suspense> with this.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted/70" />
      </div>

      <div className="flex gap-2">
        <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-28 animate-pulse rounded-md bg-muted/70" />
        <div className="ml-auto h-8 w-24 animate-pulse rounded-md bg-muted/70" />
      </div>

      <div className="space-y-px overflow-hidden rounded-xl border bg-card">
        <div className="h-11 w-full animate-pulse bg-muted/60" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-4 flex-1 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted/50" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
