// Print-only PO / invoice document. Hidden on screen (`hidden print:block`); the screen
// keeps the interactive dashboard view. Everything here is live data from the same query.
// Layout follows the JimiFern PO template (logo header, order details, items table with the
// photo first, summary + notes, authorization, footer).
import type { ReactNode } from 'react'
import { UserRound, Globe, CalendarDays, Box, Boxes, Mail, Phone, Package } from 'lucide-react'
import type { Database } from '@/lib/database.types'
import type { LineStage } from './po-stage-pipeline'

type PO = Database['public']['Tables']['purchase_orders']['Row']
type Buyer = { name: string | null; country: string | null; address: string | null; email: string | null } | null
type Company = Database['public']['Tables']['company_settings']['Row'] | null

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const [, y, mo, d] = m
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-bold tracking-wide text-neutral-700 uppercase [print-color-adjust:exact]">
      {children}
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-neutral-700" />
      <span className="font-semibold">{label}</span>
      <span className="text-neutral-400">:</span>
      <span className="text-neutral-800">{value || '—'}</span>
    </div>
  )
}

function SignBlock({ label }: { label: string }) {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-end gap-2">
        <span className="font-semibold whitespace-nowrap">{label}</span>
        <span>:</span>
        <span className="flex-1 border-b border-neutral-400" />
      </div>
      <div className="flex items-end gap-2">
        <span className="font-semibold">Date</span>
        <span>:</span>
        <span className="flex-1 border-b border-neutral-400" />
      </div>
    </div>
  )
}

export function PoPrintDoc({
  po,
  buyer,
  lines,
  totalCbm,
  company,
}: {
  po: PO
  buyer: Buyer
  lines: LineStage[]
  totalCbm: number
  company: Company
}) {
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0)
  const sellerLine = [company?.address, company?.city, company?.gstin ? `GSTIN: ${company.gstin}` : null]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <div className="hidden text-black [print-color-adjust:exact] [-webkit-print-color-adjust:exact] print:block">
      <div className="border border-neutral-400 p-5">
        {/* Logo header */}
        <div className="flex flex-col items-center gap-1.5 border-b-2 border-black pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt={company?.name ?? 'JimiFern'} className="h-14 w-auto" />
          {sellerLine ? <p className="text-[11px] text-neutral-600">{sellerLine}</p> : null}
        </div>

        {/* Title */}
        <div className="flex flex-col items-center py-4">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">PURCHASE ORDER</h1>
          <div className="mt-1.5 flex items-center gap-2 text-neutral-500">
            <span className="h-px w-8 bg-neutral-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em]">P.O.</span>
            <span className="h-px w-8 bg-neutral-400" />
          </div>
        </div>

        {/* PO number */}
        <div className="mb-5 flex items-center gap-4 rounded-xl border-2 border-neutral-300 px-6 py-3">
          <span className="text-base font-bold tracking-tight whitespace-nowrap text-neutral-700">P.O. NUMBER:</span>
          <span className="font-heading text-4xl font-extrabold tracking-tight">{po.po_no}</span>
        </div>

        {/* Order details */}
        <SectionHeader>Order Details</SectionHeader>
        <div className="mb-4 grid grid-cols-2 gap-x-10 gap-y-2.5 border border-t-0 border-neutral-300 p-4 text-sm">
          <DetailRow icon={UserRound} label="Buyer Name" value={buyer?.name} />
          <DetailRow icon={Globe} label="Shipping Country" value={po.shipping_country ?? buyer?.country} />
          <DetailRow icon={CalendarDays} label="Inspection Date" value={fmtDate(po.inspection_date)} />
          <DetailRow icon={CalendarDays} label="Shipping Date" value={fmtDate(po.delivery_date)} />
        </div>

        {/* Items table — Photo first */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-100 text-left [print-color-adjust:exact]">
              <th className="border border-neutral-300 px-2 py-2 text-center font-semibold">Photo</th>
              <th className="border border-neutral-300 px-2 py-2 font-semibold">SKU No.</th>
              <th className="border border-neutral-300 px-2 py-2 font-semibold">Item</th>
              <th className="border border-neutral-300 px-2 py-2 font-semibold">Description</th>
              <th className="border border-neutral-300 px-2 py-2 text-center font-semibold">Quantity</th>
              <th className="border border-neutral-300 px-2 py-2 text-right font-semibold">CBM (Total)</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-neutral-300 py-4 text-center text-neutral-500">
                  No items on this PO.
                </td>
              </tr>
            ) : (
              lines.map((l) => (
                <tr key={l.lineItemId} className="break-inside-avoid">
                  <td className="border border-neutral-300 p-2 text-center">
                    <span className="mx-auto grid h-16 w-20 place-items-center overflow-hidden rounded bg-neutral-50">
                      {l.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.photoUrl} alt={l.skuName} className="h-full w-full object-contain" />
                      ) : (
                        <Package className="size-5 text-neutral-300" />
                      )}
                    </span>
                  </td>
                  <td className="border border-neutral-300 px-2 py-2 font-medium">{l.skuNo}</td>
                  <td className="border border-neutral-300 px-2 py-2">{l.skuName}</td>
                  <td className="border border-neutral-300 px-2 py-2 text-neutral-700">{l.description ?? '—'}</td>
                  <td className="border border-neutral-300 px-2 py-2 text-center whitespace-nowrap tabular-nums">
                    {l.qty} PCS
                  </td>
                  <td className="border border-neutral-300 px-2 py-2 text-right tabular-nums">{l.cbm}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Summary + Notes */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <SectionHeader>Summary</SectionHeader>
            <div className="space-y-2 border border-t-0 border-neutral-300 p-4 text-sm">
              <div className="flex items-center gap-2">
                <Box className="size-4 text-neutral-700" />
                <span className="font-semibold">Total CBM</span>
                <span className="text-neutral-400">:</span>
                <span className="font-bold tabular-nums">{totalCbm}</span>
              </div>
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-neutral-700" />
                <span className="font-semibold">Total Quantity</span>
                <span className="text-neutral-400">:</span>
                <span className="font-bold tabular-nums">{totalQty} PCS</span>
              </div>
            </div>
          </div>
          <div>
            <SectionHeader>Notes</SectionHeader>
            <div className="space-y-4 border border-t-0 border-neutral-300 p-4 pt-5">
              <div className="border-b border-neutral-300" />
              <div className="border-b border-neutral-300" />
              <div className="border-b border-neutral-300" />
            </div>
          </div>
        </div>

        {/* Authorization */}
        <div className="mt-4">
          <SectionHeader>Authorization</SectionHeader>
          <div className="grid grid-cols-3 gap-8 border border-t-0 border-neutral-300 p-4">
            <SignBlock label="Prepared By" />
            <SignBlock label="Approved By" />
            <SignBlock label="Signature" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-neutral-300 pt-3 text-xs text-neutral-600">
          {company?.website ? (
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5" /> {company.website}
            </span>
          ) : null}
          {company?.email ? (
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> {company.email}
            </span>
          ) : null}
          {company?.phone ? (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> {company.phone}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
