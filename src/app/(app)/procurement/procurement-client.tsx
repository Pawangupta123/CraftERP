'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Printer } from 'lucide-react'
import { roundCft } from '@/lib/cft'
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
  wood: { wood_name: string | null; description: string | null; length: number | null; thickness: number | null; breadth: number | null; quantity: number | null }[]
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

// CFT for timber: Length(ft) × Width(in) × Thickness(in) × count ÷ 144.
const cellCft = (L: number, B: number, T: number, count: number) => (L * B * T * count) / 144

const TH = 'border border-neutral-300 px-2 py-1.5 text-left font-semibold'
const TD = 'border border-neutral-300 px-2 py-1.5 align-top'

function WoodTally({ lines }: { lines: LineData[] }) {
  // Pivot wood across all SKUs (count = qty/pc × order qty), grouped by wood name + thickness
  // (a section), then a Length (rows) × Width (columns) grid, with CFT per row / column / section.
  type Sec = { wood: string; T: number; lengths: number[]; breadths: number[]; count: Map<string, number> }
  const sections = new Map<string, Sec>()
  for (const l of lines) {
    for (const w of l.wood) {
      const T = w.thickness ?? 0
      const L = w.length ?? 0
      const B = w.breadth ?? 0
      const c = (w.quantity ?? 0) * l.qty
      if (!c && !L && !B) continue
      const wood = w.wood_name?.trim() || 'Wood'
      const sk = `${wood}||${T}`
      let sec = sections.get(sk)
      if (!sec) {
        sec = { wood, T, lengths: [], breadths: [], count: new Map() }
        sections.set(sk, sec)
      }
      const key = `${L}|${B}`
      sec.count.set(key, (sec.count.get(key) ?? 0) + c)
      if (!sec.lengths.includes(L)) sec.lengths.push(L)
      if (!sec.breadths.includes(B)) sec.breadths.push(B)
    }
  }
  if (sections.size === 0) return <Empty label="wood" />

  const secList = [...sections.values()].sort((a, b) => a.wood.localeCompare(b.wood) || a.T - b.T)
  let grand = 0
  const blocks = secList.map((sec, si) => {
    sec.lengths.sort((a, b) => a - b)
    sec.breadths.sort((a, b) => a - b)
    const sectionCft = roundCft(
      [...sec.count.entries()].reduce((s, [k, c]) => {
        const [Ls, Bs] = k.split('|')
        return s + cellCft(Number(Ls), Number(Bs), sec.T, c)
      }, 0),
    )
    grand += sectionCft
    return { sec, si, sectionCft }
  })

  return (
    <div className="space-y-4">
      {blocks.map(({ sec, si, sectionCft }) => (
        <div key={si}>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold [print-color-adjust:exact]">Section {si + 1}</span>
              <span className="font-semibold">{sec.wood}</span>
              <span className="text-neutral-400">·</span>
              <span className="font-semibold">Thickness: {sec.T}&quot;</span>
            </div>
            <span className="text-sm font-semibold text-green-800">Section CFT: {sectionCft}</span>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-800 text-white [print-color-adjust:exact]">
                <th rowSpan={2} className="border border-neutral-700 px-2 py-1 text-left align-middle">
                  {sec.wood}
                  <span className="block text-[9px] font-normal opacity-70">Length (ft) ↓</span>
                </th>
                <th colSpan={sec.breadths.length} className="border border-neutral-700 px-2 py-1 text-center">
                  Width (inch)
                </th>
                <th rowSpan={2} className="border border-green-900 bg-green-800 px-2 py-1 text-center align-middle [print-color-adjust:exact]">
                  CFT
                </th>
              </tr>
              <tr className="bg-neutral-800 text-white [print-color-adjust:exact]">
                {sec.breadths.map((B) => (
                  <th key={B} className="border border-neutral-700 px-2 py-1 text-center">
                    {B}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sec.lengths.map((L) => {
                const rowCft = roundCft(sec.breadths.reduce((s, B) => s + cellCft(L, B, sec.T, sec.count.get(`${L}|${B}`) ?? 0), 0))
                return (
                  <tr key={L}>
                    <td className="border border-neutral-300 px-2 py-1.5 text-center font-medium">{L}</td>
                    {sec.breadths.map((B) => {
                      const c = sec.count.get(`${L}|${B}`) ?? 0
                      return (
                        <td key={B} className="border border-neutral-300 px-2 py-1.5 text-center tabular-nums">
                          {c || ''}
                        </td>
                      )
                    })}
                    <td className="border border-neutral-300 bg-green-50 px-2 py-1.5 text-center font-semibold tabular-nums text-green-900 [print-color-adjust:exact]">
                      {rowCft}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-neutral-50 font-semibold [print-color-adjust:exact]">
                <td className="border border-neutral-300 px-2 py-1.5 text-center">TOTAL</td>
                {sec.breadths.map((B) => {
                  const colCft = roundCft(sec.lengths.reduce((s, L) => s + cellCft(L, B, sec.T, sec.count.get(`${L}|${B}`) ?? 0), 0))
                  return (
                    <td key={B} className="border border-neutral-300 px-2 py-1.5 text-center tabular-nums text-blue-700">
                      {colCft || ''}
                    </td>
                  )
                })}
                <td className="border border-neutral-300 bg-green-100 px-2 py-1.5 text-center tabular-nums text-green-900 [print-color-adjust:exact]">
                  {sectionCft}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
      <div className="flex justify-end">
        <div className="rounded-lg border-2 border-neutral-800 px-5 py-2 text-center">
          <p className="text-[10px] tracking-wide text-neutral-500 uppercase">Grand Total</p>
          <p className="font-heading text-2xl font-bold">{roundCft(grand)} CFT</p>
        </div>
      </div>
    </div>
  )
}

function ReportTable({ type, lines }: { type: ReportType; lines: LineData[] }) {
  if (type === 'wood') {
    return <WoodTally lines={lines} />
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

/** Editable challan field (label + underlined input the user fills; blank = a line to write on). */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-neutral-500">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-neutral-200 bg-transparent pb-0.5 text-sm font-semibold text-black outline-none focus:border-black"
      />
    </div>
  )
}

/** Read-only auto field (derived from the data). */
function AutoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-neutral-500">{label}</p>
      <p className="pb-0.5 text-sm font-semibold">{value || '—'}</p>
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

  // Challan header fields the user fills in (transient — for this print).
  const [challanNo, setChallanNo] = useState('')
  const [challanDate, setChallanDate] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [billNo, setBillNo] = useState('')
  const [partyName, setPartyName] = useState('')
  const [partyPhone, setPartyPhone] = useState('')
  const [category, setCategory] = useState('TIMBER')
  const [woodType, setWoodType] = useState('')

  // Sensible defaults when a PO is picked (user can overwrite).
  useEffect(() => {
    if (!po) return
    setPartyName(po.buyer_name)
    setChallanDate(po.date ?? '')
    const woods = new Set<string>()
    for (const l of po.lines) for (const w of l.wood) if (w.wood_name?.trim()) woods.add(w.wood_name.trim())
    setWoodType([...woods].join(', '))
  }, [po])

  // Total tally sections (distinct wood name + thickness) for the wood report.
  const woodSecKeys = new Set<string>()
  if (po) {
    for (const l of po.lines) {
      for (const w of l.wood) {
        if (w.quantity || w.length || w.breadth) woodSecKeys.add(`${w.wood_name?.trim() || 'Wood'}|${w.thickness ?? 0}`)
      }
    }
  }
  const sectionCount = woodSecKeys.size

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
            {/* Company + Challan No (NIRVANA-style challan header) */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.png" alt={company?.name ?? 'JimiFern'} className="h-9 w-auto" />
                <div className="border-l border-neutral-300 pl-3">
                  <p className="text-[11px] font-semibold tracking-wide text-neutral-600 uppercase">
                    {report === 'wood' ? 'Timber stock & dispatch' : `${reportLabel} procurement`}
                  </p>
                  {sellerLine ? <p className="text-[10px] text-neutral-500">{sellerLine}</p> : null}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] tracking-wide text-neutral-500 uppercase">Challan No.</p>
                <div className="flex items-baseline justify-end">
                  <span className="text-2xl font-extrabold text-neutral-400">#</span>
                  <input
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    placeholder="000"
                    className="w-24 border-b border-neutral-200 bg-transparent text-right font-heading text-2xl font-extrabold tracking-tight outline-none placeholder:text-neutral-300 focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Editable challan details — user fills these (vehicle, bill, party…) */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-3 py-4">
              <Field label="Date" value={challanDate} onChange={setChallanDate} placeholder="DD / MM / YYYY" />
              <Field label="Vehicle Number" value={vehicleNo} onChange={setVehicleNo} placeholder="e.g. RJ19 GJ 8140" />
              <div>
                <p className="mb-0.5 text-xs text-neutral-500">Receiver / Party</p>
                <input
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Name"
                  className="w-full border-b border-neutral-200 bg-transparent pb-0.5 text-sm font-semibold text-black outline-none focus:border-black"
                />
                <input
                  value={partyPhone}
                  onChange={(e) => setPartyPhone(e.target.value)}
                  placeholder="Phone"
                  className="mt-1 w-full border-b border-neutral-200 bg-transparent pb-0.5 text-xs text-neutral-600 outline-none focus:border-black"
                />
              </div>

              {report === 'wood' ? (
                <>
                  <Field label="Category" value={category} onChange={setCategory} placeholder="TIMBER" />
                  <Field label="Wood Type" value={woodType} onChange={setWoodType} placeholder="e.g. Mango, Sheesham" />
                  <AutoField label="Total Sections" value={String(sectionCount)} />
                </>
              ) : (
                <>
                  <AutoField label="Material" value={reportLabel} />
                  <AutoField label="PO Total CBM" value={String(po.totalCbm)} />
                  <div />
                </>
              )}

              <Field label="Bill No." value={billNo} onChange={setBillNo} placeholder="" />
              <AutoField label="P.O. No" value={po.po_no} />
              {report === 'wood' ? <AutoField label="PO Total CBM" value={String(po.totalCbm)} /> : <div />}
            </div>

            <div className="mb-4 border-b-2 border-black" />

            {/* Measurement table */}
            {report !== 'wood' ? (
              <SectionHeader>{reportLabel} — master measurement (× order qty)</SectionHeader>
            ) : null}
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
