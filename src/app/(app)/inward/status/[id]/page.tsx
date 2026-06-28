import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProcurement, type MaterialStat } from '@/lib/procurement'
import { MATERIAL_LABEL } from '@/lib/material-inward'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = { title: 'PO procurement · CraftERP' }

const STATUS: Record<string, { label: string; cls: string }> = {
  complete: { label: 'Complete', cls: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partial', cls: 'bg-amber-100 text-amber-800' },
  pending: { label: 'Pending', cls: 'bg-stone-100 text-stone-600' },
  'no-bom': { label: 'No BOM', cls: 'bg-stone-100 text-stone-500' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.pending
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', s.cls)}>{s.label}</span>
}

function MaterialPanel({ label, stat }: { label: string; stat: MaterialStat }) {
  const bar =
    stat.status === 'complete' ? 'bg-emerald-500' : stat.status === 'partial' ? 'bg-amber-500' : 'bg-muted-foreground/30'
  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-heading font-medium">{label}</span>
          <StatusBadge status={stat.status} />
        </div>
        {stat.status === 'no-bom' ? (
          <p className="text-sm text-muted-foreground">No BOM for this material.</p>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl font-semibold tabular-nums">{stat.received}</span>
              <span className="text-sm text-muted-foreground">
                / {stat.required} {stat.unit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full', bar)} style={{ width: `${stat.pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stat.pct}% received</span>
              {stat.surplus > 0 ? <span className="text-emerald-600">Surplus {stat.surplus} → stock</span> : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default async function POProcurementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: me } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }
  if (me?.role !== 'admin') redirect('/inward')

  const list = await getProcurement(id)
  const data = list[0]
  if (!data) notFound()

  const { data: inwards } = await supabase
    .from('inward_entries')
    .select('id, inward_no, date, material_type, total_cft, total_pieces')
    .eq('po_id', id)
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/inward/status"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to procurement status
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{data.po_no} — Procurement</h1>
        <p className="text-sm text-muted-foreground">{data.buyer}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MaterialPanel label="Wood" stat={data.wood} />
        <MaterialPanel label="Iron" stat={data.iron} />
        <MaterialPanel label="Hardware" stat={data.hardware} />
        <MaterialPanel label="Packaging" stat={data.packaging} />
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="font-heading text-base font-medium">Inward entries for this PO</h2>
          {inwards && inwards.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Pieces</TableHead>
                    <TableHead className="text-right">CFT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inwards.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/inward/${e.id}`} className="font-medium text-primary hover:underline">
                          {e.inward_no ?? '—'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.date}</TableCell>
                      <TableCell>{MATERIAL_LABEL[e.material_type] ?? e.material_type}</TableCell>
                      <TableCell className="text-right tabular-nums">{e.total_pieces}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {e.material_type === 'wood' ? e.total_cft : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No inward recorded for this PO yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
