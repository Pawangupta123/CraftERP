import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { roundCft } from '@/lib/inward-cft'

export type MaterialStat = {
  required: number
  received: number
  surplus: number
  pct: number
  unit: string
  status: 'no-bom' | 'pending' | 'partial' | 'complete'
}

export type POProcurement = {
  id: string
  po_no: string
  buyer: string
  wood: MaterialStat
  iron: MaterialStat
  hardware: MaterialStat
  packaging: MaterialStat
}

function stat(required: number, received: number, unit: string): MaterialStat {
  const req = roundCft(required)
  const rec = roundCft(received)
  const pct = req > 0 ? Math.min(100, Math.round((rec / req) * 100)) : 0
  const surplus = rec > req ? roundCft(rec - req) : 0
  const status = req === 0 ? 'no-bom' : rec >= req ? 'complete' : rec > 0 ? 'partial' : 'pending'
  return { required: req, received: rec, surplus, pct, unit, status }
}

type Bucket = { wood: number; iron: number; hw: number; pkg: number }
const empty = (): Bucket => ({ wood: 0, iron: 0, hw: 0, pkg: 0 })

/**
 * Per-PO procurement status across all materials.
 *  - Wood is tracked in CFT (from wood BOM × order qty).
 *  - Iron / Hardware / Packaging are tracked by total quantity.
 * Pass a poId to compute for a single PO.
 */
export async function getProcurement(poId?: string): Promise<POProcurement[]> {
  const supabase = await createClient()

  const [posRes, buyersRes, lineRes, inwardRes] = await Promise.all([
    supabase.from('purchase_orders').select('id, po_no, buyer_id').order('created_at', { ascending: false }),
    supabase.from('buyers').select('id, name'),
    supabase.from('po_line_items').select('po_id, sku_id, quantity'),
    supabase.from('inward_entries').select('po_id, material_type, total_cft, total_pieces'),
  ])

  const pos = poId ? (posRes.data ?? []).filter((p) => p.id === poId) : posRes.data ?? []
  const poIds = new Set(pos.map((p) => p.id))
  const lines = (lineRes.data ?? []).filter((l) => poIds.has(l.po_id))
  const skuIds = [...new Set(lines.map((l) => l.sku_id))]

  const [woodRes, ironRes, hwRes, pkgRes] = await Promise.all([
    supabase.from('wood_components').select('sku_id, length, thickness, breadth, quantity').in('sku_id', skuIds),
    supabase.from('iron_components').select('sku_id').in('sku_id', skuIds),
    supabase.from('hardware_components').select('sku_id, quantity').in('sku_id', skuIds),
    supabase.from('packaging_materials').select('sku_id, quantity').in('sku_id', skuIds),
  ])

  // Per-SKU "per unit" needs.
  const skuWoodCft = new Map<string, number>()
  for (const w of woodRes.data ?? []) {
    const v = (w.length ?? 0) * (w.thickness ?? 0) * (w.breadth ?? 0) * (w.quantity ?? 0)
    skuWoodCft.set(w.sku_id, (skuWoodCft.get(w.sku_id) ?? 0) + v / 1728)
  }
  const skuIronCount = new Map<string, number>()
  for (const r of ironRes.data ?? []) skuIronCount.set(r.sku_id, (skuIronCount.get(r.sku_id) ?? 0) + 1)
  const skuHwQty = new Map<string, number>()
  for (const r of hwRes.data ?? []) skuHwQty.set(r.sku_id, (skuHwQty.get(r.sku_id) ?? 0) + (r.quantity ?? 0))
  const skuPkgQty = new Map<string, number>()
  for (const r of pkgRes.data ?? []) skuPkgQty.set(r.sku_id, (skuPkgQty.get(r.sku_id) ?? 0) + (parseFloat(r.quantity ?? '') || 0))

  const required = new Map<string, Bucket>()
  for (const l of lines) {
    const cur = required.get(l.po_id) ?? empty()
    cur.wood += (skuWoodCft.get(l.sku_id) ?? 0) * l.quantity
    cur.iron += (skuIronCount.get(l.sku_id) ?? 0) * l.quantity
    cur.hw += (skuHwQty.get(l.sku_id) ?? 0) * l.quantity
    cur.pkg += (skuPkgQty.get(l.sku_id) ?? 0) * l.quantity
    required.set(l.po_id, cur)
  }

  const received = new Map<string, Bucket>()
  for (const e of inwardRes.data ?? []) {
    if (!e.po_id || !poIds.has(e.po_id)) continue
    const cur = received.get(e.po_id) ?? empty()
    if (e.material_type === 'wood') cur.wood += e.total_cft
    else if (e.material_type === 'iron') cur.iron += e.total_pieces
    else if (e.material_type === 'hardware') cur.hw += e.total_pieces
    else if (e.material_type === 'packaging') cur.pkg += e.total_pieces
    received.set(e.po_id, cur)
  }

  const buyerMap = new Map((buyersRes.data ?? []).map((b) => [b.id, b.name]))
  return pos.map((po) => {
    const r = required.get(po.id) ?? empty()
    const g = received.get(po.id) ?? empty()
    return {
      id: po.id,
      po_no: po.po_no,
      buyer: buyerMap.get(po.buyer_id) ?? '—',
      wood: stat(r.wood, g.wood, 'CFT'),
      iron: stat(r.iron, g.iron, 'pcs'),
      hardware: stat(r.hw, g.hw, 'pcs'),
      packaging: stat(r.pkg, g.pkg, 'pcs'),
    }
  })
}
