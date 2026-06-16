'use client'

import { useState, type ReactNode } from 'react'
import { Printer } from 'lucide-react'
import { CFT_DIVISOR, DEFAULT_CFT_UNIT, roundCft } from '@/lib/cft'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Database } from '@/lib/database.types'

export type LineData = {
  skuNo: string
  skuName: string
  qty: number
  wood: { description: string | null; length: number | null; thickness: number | null; breadth: number | null; quantity: number | null }[]
  iron: { description: string | null; section: string | null; length: number | null; width: number | null; remark: string | null; picture_urls: string[] }[]
  hardware: { name: string | null; description: string | null; quantity: number | null; unit: string | null }[]
  packaging: { material: string | null; specification: string | null; quantity: string | null }[]
}
export type POData = {
  id: string
  po_no: string
  buyer_id: string
  buyer_name: string
  date: string | null
  lines: LineData[]
  totalCbm: number
}

type BuyerOpt = { id: string; name: string }
type Company = Database['public']['Tables']['company_settings']['Row'] | null
type ReportType = 'wood' | 'iron' | 'hardware' | 'packaging'

const REPORTS: { key: ReportType; label: string }[] = [
  { key: 'wood', label: 'Wood' },
  { key: 'iron', label: 'Iron' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'packaging', label: 'Packaging' },
]

const n = (v: number | null) => (v === null || v === undefined ? '—' : v)

// CFT (cubic feet) of timber: (L × T × B in inches) ÷ 1728 per piece, × pieces × order qty.
const CFT_DIV = CFT_DIVISOR[DEFAULT_CFT_UNIT]
function woodRowCft(
  w: { length: number | null; thickness: number | null; breadth: number | null; quantity: number | null },
  orderQty: number,
): number {
  return roundCft((((w.length ?? 0) * (w.thickness ?? 0) * (w.breadth ?? 0) * (w.quantity ?? 0)) / CFT_DIV) * orderQty)
}

const TH = 'border border-neutral-300 px-2 py-1.5 text-left font-semibold'
const TD = 'border border-neutral-300 px-2 py-1.5 align-top'

function ReportTable({ type, lines }: { type: ReportType; lines: LineData[] }) {
  if (type === 'wood') {
    const rows = lines.flatMap((l) => l.wood.map((w) => ({ l, w })))
    if (rows.length === 0) return <Empty label="wood" />
    const totalCft = roundCft(rows.reduce((s, { l, w }) => s + woodRowCft(w, l.qty), 0))
    return (
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-neutral-100 [print-color-adjust:exact]">
            <th className={TH}>#</th>
            <th className={TH}>Item (SKU)</th>
            <th className={TH}>Description</th>
            <th className={`${TH} text-right`}>L</th>
            <th className={`${TH} text-right`}>T</th>
            <th className={`${TH} text-right`}>B</th>
            <th className={`${TH} text-right`}>Qty/pc</th>
            <th className={`${TH} text-right`}>Order qty</th>
            <th className={`${TH} text-right`}>Total pcs</th>
            <th className={`${TH} text-right`}>CFT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ l, w }, i) => (
            <tr key={i} className="break-inside-avoid">
              <td className={`${TD} tabular-nums`}>{i + 1}</td>
              <td className={TD}>
                <div className="font-medium">{l.skuName}</div>
                <div className="text-neutral-500">{l.skuNo}</div>
              </td>
              <td className={TD}>{w.description ?? '—'}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(w.length)}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(w.thickness)}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(w.breadth)}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(w.quantity)}</td>
              <td className={`${TD} text-right tabular-nums`}>{l.qty}</td>
              <td className={`${TD} text-right font-semibold tabular-nums`}>{(w.quantity ?? 0) * l.qty}</td>
              <td className={`${TD} text-right tabular-nums`}>{woodRowCft(w, l.qty)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-50 font-semibold [print-color-adjust:exact]">
            <td className={TD} colSpan={9}>
              Total CFT (inches basis)
            </td>
            <td className={`${TD} text-right tabular-nums`}>{totalCft}</td>
          </tr>
        </tfoot>
      </table>
    )
  }

  if (type === 'iron') {
    const rows = lines.flatMap((l) => l.iron.map((x) => ({ l, x })))
    if (rows.length === 0) return <Empty label="iron" />
    return (
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-neutral-100 [print-color-adjust:exact]">
            <th className={TH}>#</th>
            <th className={TH}>Item (SKU)</th>
            <th className={TH}>Description</th>
            <th className={TH}>Section</th>
            <th className={`${TH} text-right`}>L</th>
            <th className={`${TH} text-right`}>W</th>
            <th className={`${TH} text-right`}>Order qty</th>
            <th className={TH}>Remark</th>
            <th className={TH}>Photos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ l, x }, i) => (
            <tr key={i} className="break-inside-avoid">
              <td className={`${TD} tabular-nums`}>{i + 1}</td>
              <td className={TD}>
                <div className="font-medium">{l.skuName}</div>
                <div className="text-neutral-500">{l.skuNo}</div>
              </td>
              <td className={TD}>{x.description ?? '—'}</td>
              <td className={TD}>{x.section ?? '—'}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(x.length)}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(x.width)}</td>
              <td className={`${TD} text-right tabular-nums`}>{l.qty}</td>
              <td className={TD}>{x.remark ?? '—'}</td>
              <td className={TD}>
                {x.picture_urls.length ? (
                  <div className="flex flex-wrap gap-1">
                    {x.picture_urls.map((url, pi) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={pi} src={url} alt="" className="size-10 rounded border object-cover" />
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (type === 'hardware') {
    const rows = lines.flatMap((l) => l.hardware.map((h) => ({ l, h })))
    if (rows.length === 0) return <Empty label="hardware" />
    return (
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-neutral-100 [print-color-adjust:exact]">
            <th className={TH}>#</th>
            <th className={TH}>Item (SKU)</th>
            <th className={TH}>Name</th>
            <th className={TH}>Description</th>
            <th className={`${TH} text-right`}>Qty/pc</th>
            <th className={TH}>Unit</th>
            <th className={`${TH} text-right`}>Order qty</th>
            <th className={`${TH} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ l, h }, i) => (
            <tr key={i} className="break-inside-avoid">
              <td className={`${TD} tabular-nums`}>{i + 1}</td>
              <td className={TD}>
                <div className="font-medium">{l.skuName}</div>
                <div className="text-neutral-500">{l.skuNo}</div>
              </td>
              <td className={TD}>{h.name ?? '—'}</td>
              <td className={TD}>{h.description ?? '—'}</td>
              <td className={`${TD} text-right tabular-nums`}>{n(h.quantity)}</td>
              <td className={TD}>{h.unit ?? '—'}</td>
              <td className={`${TD} text-right tabular-nums`}>{l.qty}</td>
              <td className={`${TD} text-right font-semibold tabular-nums`}>{(h.quantity ?? 0) * l.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // packaging
  const rows = lines.flatMap((l) => l.packaging.map((m) => ({ l, m })))
  if (rows.length === 0) return <Empty label="packaging" />
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="bg-neutral-100 [print-color-adjust:exact]">
          <th className={TH}>#</th>
          <th className={TH}>Item (SKU)</th>
          <th className={TH}>Material</th>
          <th className={TH}>Specification</th>
          <th className={TH}>Qty</th>
          <th className={`${TH} text-right`}>Order qty</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ l, m }, i) => (
          <tr key={i} className="break-inside-avoid">
            <td className={`${TD} tabular-nums`}>{i + 1}</td>
            <td className={TD}>
              <div className="font-medium">{l.skuName}</div>
              <div className="text-neutral-500">{l.skuNo}</div>
            </td>
            <td className={TD}>{m.material ?? '—'}</td>
            <td className={TD}>{m.specification ?? '—'}</td>
            <td className={TD}>{m.quantity ?? '—'}</td>
            <td className={`${TD} text-right tabular-nums`}>{l.qty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Empty({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-neutral-500">No {label} components on this PO.</p>
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-bold tracking-wide text-neutral-700 uppercase [print-color-adjust:exact]">
      {children}
    </div>
  )
}

export function ProcurementClient({ buyers, pos, company }: { buyers: BuyerOpt[]; pos: POData[]; company: Company }) {
  const [buyerId, setBuyerId] = useState('')
  const [poId, setPoId] = useState('')
  const [report, setReport] = useState<ReportType>('wood')

  const buyerPos = pos.filter((p) => p.buyer_id === buyerId)
  const po = pos.find((p) => p.id === poId)
  const reportLabel = REPORTS.find((r) => r.key === report)?.label ?? ''
  const sellerLine = [company?.address, company?.city, company?.gstin ? `GSTIN: ${company.gstin}` : null]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <div className="space-y-6">
      {/* Controls (hidden when printing) */}
      <div className="space-y-4 print:hidden">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Procurement</h1>
          <p className="text-sm text-muted-foreground">
            Pick a buyer and PO to print the master measurement (napi) report for each raw material.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Buyer</Label>
            <Select
              value={buyerId}
              onValueChange={(v) => {
                setBuyerId(v)
                setPoId('')
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No buyers with POs.</div>
                ) : (
                  buyers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Purchase order</Label>
            <Select value={poId} onValueChange={setPoId} disabled={!buyerId}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={buyerId ? 'Select PO' : 'Select a buyer first'} />
              </SelectTrigger>
              <SelectContent>
                {buyerPos.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No POs for this buyer.</div>
                ) : (
                  buyerPos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.po_no}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {po ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex flex-wrap gap-1.5">
              {REPORTS.map((r) => (
                <Button
                  key={r.key}
                  variant={report === r.key ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setReport(r.key)}
                >
                  {r.label} report
                </Button>
              ))}
            </div>
            <Button onClick={() => window.print()}>
              <Printer className="size-4" />
              Print {reportLabel}
            </Button>
          </div>
        ) : null}
      </div>

      {/* Report document — same challan/invoice format (shown on screen + print) */}
      {po ? (
        <div className="rounded-xl border bg-white p-5 text-black [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:rounded-none print:border-0 print:p-0">
          <div className="border border-neutral-400 p-5">
            {/* Logo header */}
            <div className="flex flex-col items-center gap-1.5 border-b-2 border-black pb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt={company?.name ?? 'JimiFern'} className="h-14 w-auto" />
              {sellerLine ? <p className="text-[11px] text-neutral-600">{sellerLine}</p> : null}
            </div>

            {/* Title */}
            <div className="flex flex-col items-center py-3">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight">{reportLabel.toUpperCase()} CHALLAN</h1>
              <div className="mt-1.5 flex items-center gap-2 text-neutral-500">
                <span className="h-px w-8 bg-neutral-400" />
                <span className="text-[11px] font-semibold tracking-[0.25em]">PROCUREMENT</span>
                <span className="h-px w-8 bg-neutral-400" />
              </div>
            </div>

            {/* PO number */}
            <div className="mb-4 flex items-center gap-4 rounded-xl border-2 border-neutral-300 px-6 py-2.5">
              <span className="text-base font-bold tracking-tight whitespace-nowrap text-neutral-700">P.O. NUMBER:</span>
              <span className="font-heading text-3xl font-extrabold tracking-tight">{po.po_no}</span>
            </div>

            {/* Details */}
            <SectionHeader>Order Details</SectionHeader>
            <div className="mb-4 grid grid-cols-2 gap-x-10 gap-y-2 border border-t-0 border-neutral-300 p-4 text-sm">
              <div>
                <span className="text-neutral-500">Buyer: </span>
                <span className="font-medium">{po.buyer_name}</span>
              </div>
              <div>
                <span className="text-neutral-500">Date: </span>
                {po.date ?? '—'}
              </div>
              <div>
                <span className="text-neutral-500">Report: </span>
                <span className="font-medium">{reportLabel}</span>
              </div>
              <div>
                <span className="text-neutral-500">PO Total CBM: </span>
                <span className="font-medium tabular-nums">{po.totalCbm}</span>
              </div>
            </div>

            {/* Measurement table */}
            <SectionHeader>{reportLabel} — master measurement (× order qty)</SectionHeader>
            <ReportTable type={report} lines={po.lines} />

            {/* Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-neutral-300 pt-3 text-xs text-neutral-600">
              {company?.website ? <span>{company.website}</span> : null}
              {company?.email ? <span>{company.email}</span> : null}
              {company?.phone ? <span>{company.phone}</span> : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground print:hidden">
          Select a buyer and PO to see the procurement reports.
        </div>
      )}
    </div>
  )
}
