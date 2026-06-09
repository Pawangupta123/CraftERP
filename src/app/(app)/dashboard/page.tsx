import type { Metadata } from 'next'
import { Users, Package, FileText, CreditCard, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard · CraftERP' }

async function getStats() {
  const supabase = await createClient()
  const [buyers, skus, pos, payments] = await Promise.all([
    supabase.from('buyers').select('*', { count: 'exact', head: true }),
    supabase.from('skus').select('*', { count: 'exact', head: true }),
    supabase.from('purchase_orders').select('status'),
    supabase.from('payments').select('*', { count: 'exact', head: true }),
  ])

  const poRows = pos.data ?? []
  return {
    buyers: buyers.count ?? 0,
    skus: skus.count ?? 0,
    pos: poRows.length,
    payments: payments.count ?? 0,
    byStatus: {
      upcoming: poRows.filter((p) => p.status === 'upcoming').length,
      in_progress: poRows.filter((p) => p.status === 'in_progress').length,
      completed: poRows.filter((p) => p.status === 'completed').length,
    },
  }
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}

function StageStat({
  label,
  value,
  dot,
}: {
  label: string
  value: number
  dot: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn('size-2 rounded-full', dot)} />
        {label}
      </span>
      <span className="font-heading text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

export default async function DashboardPage() {
  const s = await getStats()
  const empty = s.buyers + s.skus + s.pos === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">A quick overview of your business.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Buyers" value={s.buyers} icon={Users} />
        <StatCard label="Items (SKU)" value={s.skus} icon={Package} />
        <StatCard label="Purchase Orders" value={s.pos} icon={FileText} />
        <StatCard label="Payments recorded" value={s.payments} icon={CreditCard} />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-heading text-base font-medium">Purchase Orders by stage</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <StageStat label="Upcoming" value={s.byStatus.upcoming} dot="bg-blue-500" />
            <StageStat label="In Progress" value={s.byStatus.in_progress} dot="bg-amber-500" />
            <StageStat label="Completed" value={s.byStatus.completed} dot="bg-emerald-600" />
          </div>
        </CardContent>
      </Card>

      {empty ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No data yet. To get started, add{' '}
            <span className="font-medium text-foreground">Buyers</span> and{' '}
            <span className="font-medium text-foreground">Items (SKU)</span> first — those
            modules are coming in the next phase.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
