import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { roundCbm } from '@/lib/cbm'
import { ProcurementClient, type POData, type LineData } from './procurement-client'

export const metadata: Metadata = { title: 'Procurement · JimiFern' }

export default async function ProcurementPage() {
  const supabase = await createClient()

  const [buyersRes, posRes, liRes] = await Promise.all([
    supabase.from('buyers').select('id, name').order('name'),
    supabase.from('purchase_orders').select('id, po_no, buyer_id, created_at').order('created_at', { ascending: false }),
    supabase.from('po_line_items').select('id, po_id, sku_id, quantity, position').order('position'),
  ])
  const buyers = buyersRes.data ?? []
  const pos = posRes.data ?? []
  const lineItems = liRes.data ?? []

  const skuIds = [...new Set(lineItems.map((l) => l.sku_id))]
  const [skusRes, woodRes, ironRes, hwRes, pkgRes] = await Promise.all([
    supabase.from('skus').select('id, sku_no, name, cbm').in('id', skuIds),
    supabase.from('wood_components').select('sku_id, description, length, thickness, breadth, quantity, position').in('sku_id', skuIds).order('position'),
    supabase.from('iron_components').select('sku_id, description, section, length, width, remark, picture_urls, position').in('sku_id', skuIds).order('position'),
    supabase.from('hardware_components').select('sku_id, name, description, quantity, unit, position').in('sku_id', skuIds).order('position'),
    supabase.from('packaging_materials').select('sku_id, material, specification, quantity, position').in('sku_id', skuIds).order('position'),
  ])

  const skuMap = new Map((skusRes.data ?? []).map((s) => [s.id, s]))
  const groupBy = <T extends { sku_id: string }>(rows: T[]) => {
    const m = new Map<string, T[]>()
    for (const r of rows) {
      const arr = m.get(r.sku_id) ?? []
      arr.push(r)
      m.set(r.sku_id, arr)
    }
    return m
  }
  const woodBy = groupBy(woodRes.data ?? [])
  const ironBy = groupBy(ironRes.data ?? [])
  const hwBy = groupBy(hwRes.data ?? [])
  const pkgBy = groupBy(pkgRes.data ?? [])

  const linesByPo = new Map<string, typeof lineItems>()
  for (const l of lineItems) {
    const arr = linesByPo.get(l.po_id) ?? []
    arr.push(l)
    linesByPo.set(l.po_id, arr)
  }
  const buyerName = new Map(buyers.map((b) => [b.id, b.name]))

  const poData: POData[] = pos.map((p) => {
    const poLines = linesByPo.get(p.id) ?? []
    const totalCbm = roundCbm(poLines.reduce((s, l) => s + (skuMap.get(l.sku_id)?.cbm ?? 0) * l.quantity, 0))
    const lines: LineData[] = poLines.map((l) => {
      const sku = skuMap.get(l.sku_id)
      return {
        skuNo: sku?.sku_no ?? '—',
        skuName: sku?.name ?? '—',
        qty: l.quantity,
        wood: (woodBy.get(l.sku_id) ?? []).map((w) => ({
          description: w.description,
          length: w.length,
          thickness: w.thickness,
          breadth: w.breadth,
          quantity: w.quantity,
        })),
        iron: (ironBy.get(l.sku_id) ?? []).map((x) => ({
          description: x.description,
          section: x.section,
          length: x.length,
          width: x.width,
          remark: x.remark,
          picture_urls: x.picture_urls ?? [],
        })),
        hardware: (hwBy.get(l.sku_id) ?? []).map((h) => ({
          name: h.name,
          description: h.description,
          quantity: h.quantity,
          unit: h.unit,
        })),
        packaging: (pkgBy.get(l.sku_id) ?? []).map((m) => ({
          material: m.material,
          specification: m.specification,
          quantity: m.quantity,
        })),
      }
    })
    return {
      id: p.id,
      po_no: p.po_no,
      buyer_id: p.buyer_id,
      buyer_name: buyerName.get(p.buyer_id) ?? '—',
      date: p.created_at ? p.created_at.slice(0, 10) : null,
      lines,
      totalCbm,
    }
  })

  const buyerIdsWithPos = new Set(poData.map((p) => p.buyer_id))
  const activeBuyers = buyers.filter((b) => buyerIdsWithPos.has(b.id))

  return <ProcurementClient buyers={activeBuyers} pos={poData} />
}
