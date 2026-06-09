import { Hammer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function ComingSoon({
  title,
  phase,
  note,
}: {
  title: string
  phase: string
  note?: string
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <Hammer className="size-6" />
          </span>
          <Badge variant="secondary">{phase}</Badge>
          <p className="max-w-sm text-sm text-muted-foreground">
            {note ?? 'This module is coming soon. The foundation and database are ready — only the screen needs to be built.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
