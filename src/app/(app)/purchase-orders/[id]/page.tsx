import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Pencil, Truck, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PO_STATUS } from '@/lib/po-status'
import {
  OVERALL_PHASES,
  STAGE_KEYS,
  maxStage,
  phaseIndex,
  stageIndex,
  stageMeta,
} from '@/lib/po-stages'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { POStagePipeline, type LineStage } from '../po-stage-pipeline'
import { PoPrintDoc } from '../po-print'
import { PrintButton, StatusControl } from '../po-detail-client'

export const metadata: Metadata = { title: 'Purchase order · CraftERP' }

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}

const round3 = (v: number): number => Math.round(v * 1000) / 1000

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: me } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }
  const isAdmin = me?.role === 'admin'

  const { data: po } = await supabase.from('purchase_orders').select('*').eq('id', id).maybeSingle()
  if (!po) notFound()

  const { data: buyer } = await supabase
    .from('buyers')
    .select('name, country, email, address')
    .eq('id', po.buyer_id)
    .maybeSingle()

  const { data: lineItems } = await supabase
    .from('po_line_items')
    .select('id, sku_id, quantity, position')
    .eq('po_id', id)
    .order('position')
  const items = lineItems ?? []
  const skuIds = [...new Set(items.map((i) => i.sku_id))]
  const lineIds = items.map((i) => i.id)

  const [skusRes, stageRes, companyRes] = await Promise.all([
    supabase.from('skus').select('id, sku_no, name, photo_url, description, cbm').in('id', skuIds),
    supabase.from('stage_tracking').select('po_line_item_id, current_stage').in('po_line_item_id', lineIds),
    supabase.from('company_settings').select('*').limit(1).maybeSingle(),
  ])
  const company = companyRes.data
  const skuMap = new Map((skusRes.data ?? []).map((s) => [s.id, s]))
  const stageByLine = new Map((stageRes.data ?? []).map((s) => [s.po_line_item_id, s.current_stage]))

  const lines: LineStage[] = items.map((it) => {
    const sku = skuMap.get(it.sku_id)
    return {
      lineItemId: it.id,
      skuNo: sku?.sku_no ?? '—',
      skuName: sku?.name ?? '—',
      photoUrl: sku?.photo_url ?? null,
      description: sku?.description ?? null,
      qty: it.quantity,
      cbm: round3((sku?.cbm ?? 0) * it.quantity),
      stage: (stageByLine.get(it.id) as LineStage['stage']) ?? null,
    }
  })

  const totalCbm = round3(lines.reduce((sum, l) => sum + l.cbm, 0))

  // PO rollup: the furthest stage across all SKUs.
  const poStageKey = maxStage(lines.map((l) => l.stage))
  const poStage = stageMeta(poStageKey)
  const maxIdx = stageIndex(poStageKey)
  const progressPct = maxIdx < 0 ? 0 : ((maxIdx + 1) / STAGE_KEYS.length) * 100
  const reachedPhase = phaseIndex(poStageKey)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/purchase-orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to purchase orders
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/purchase-orders/${po.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <StatusControl id={po.id} status={po.status} />
            </>
          ) : null}
          <PrintButton />
        </div>
      </div>

      <div className="print:hidden">
      <Card>
        <CardContent className="space-y-6 py-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Purchase Order</p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">{po.po_no}</h1>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', PO_STATUS[po.status].badge)}>
                {PO_STATUS[po.status].label}
              </span>
              {poStage ? (
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', poStage.badge)}>
                  <poStage.icon className="size-3" />
                  {poStage.label}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Not started
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <Field label="Buyer" value={buyer?.name} />
            <Field label="Shipping country" value={po.shipping_country ?? buyer?.country} />
            <Field label="Delivery date (deadline)" value={po.delivery_date} />
            <Field label="Inspection date" value={po.inspection_date} />
            <div>
              <p className="text-xs text-muted-foreground">BRC</p>
              <p className="font-medium">
                {po.brc ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <Check className="size-4" /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <X className="size-4" /> No
                  </span>
                )}
              </p>
            </div>
            <Field label="BRC deadline" value={po.brc_deadline} />
          </div>

          {po.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={po.photo_url} alt="PO reference" className="max-h-48 rounded-lg border object-contain" />
          ) : null}

          {/* Overall pipeline: Procure → Prod → Shipping, with a travelling truck */}
          <div className="space-y-3 rounded-xl border bg-gradient-to-br from-muted/40 to-transparent p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Overall progress</p>
            <div className="flex items-center justify-between text-xs font-semibold">
              {OVERALL_PHASES.map((ph, i) => (
                <span key={ph.key} className={cn(reachedPhase >= i ? 'text-foreground' : 'text-muted-foreground')}>
                  {ph.label}
                </span>
              ))}
            </div>
            <div className="relative h-2 rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all"
                style={{ width: `${progressPct}%` }}
              />
              <span
                className="absolute -top-3 grid size-6 -translate-x-1/2 place-items-center rounded-full border border-amber-700/30 bg-background text-amber-700 transition-all"
                style={{ left: `${progressPct}%` }}
              >
                <Truck className="size-3" />
              </span>
            </div>
          </div>

          {/* Per-SKU stage pipeline (click a stage to update it) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-medium">Items &amp; production stage</h2>
              <span className="text-xs text-muted-foreground">Tap a stage to update</span>
            </div>
            <POStagePipeline poId={po.id} lines={lines} />
          </div>

          {/* Total CBM */}
          <div className="flex justify-end">
            <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
              <span className="text-muted-foreground">Total CBM: </span>
              <span className="font-heading text-base font-semibold tabular-nums">{totalCbm}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <PoPrintDoc po={po} buyer={buyer} lines={lines} totalCbm={totalCbm} company={company} />
    </div>
  )
}
