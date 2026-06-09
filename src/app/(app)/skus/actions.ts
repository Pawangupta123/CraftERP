'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SkuPayload = {
  sku_no: string
  name: string
  photo_url: string | null
  description: string | null
  remark: string | null
  wood: {
    description: string | null
    length: number | null
    thickness: number | null
    breadth: number | null
    quantity: number | null
  }[]
  iron: {
    description: string | null
    section: string | null
    length: number | null
    width: number | null
    remark: string | null
  }[]
  hardware: {
    name: string | null
    description: string | null
    quantity: number | null
    unit: string | null
  }[]
  packaging: {
    corrugated_box: string | null
    labels: string | null
    barcode: string | null
    corners: string | null
  } | null
}

export async function createSku(payload: SkuPayload): Promise<{ error?: string; id?: string }> {
  const name = payload.name.trim()
  if (!name) return { error: 'Item name is required.' }

  const supabase = await createClient()

  // Auto-generate SKU number when left blank (SKU-0001, SKU-0002, …)
  let skuNo = payload.sku_no.trim()
  if (!skuNo) {
    const { count } = await supabase.from('skus').select('*', { count: 'exact', head: true })
    skuNo = `SKU-${String((count ?? 0) + 1).padStart(4, '0')}`
  }

  const { data: sku, error } = await supabase
    .from('skus')
    .insert({
      sku_no: skuNo,
      name,
      photo_url: payload.photo_url,
      description: payload.description,
      remark: payload.remark,
    })
    .select('id')
    .single()

  if (error || !sku) {
    return { error: error?.message ?? 'Could not create item.' }
  }
  const skuId = sku.id

  const wood = payload.wood
    .filter((w) => w.description || w.length || w.thickness || w.breadth || w.quantity)
    .map((w, i) => ({ sku_id: skuId, ...w, position: i }))
  if (wood.length) {
    const { error: e } = await supabase.from('wood_components').insert(wood)
    if (e) return { error: e.message }
  }

  const iron = payload.iron
    .filter((x) => x.description || x.section || x.length || x.width || x.remark)
    .map((x, i) => ({ sku_id: skuId, ...x, position: i }))
  if (iron.length) {
    const { error: e } = await supabase.from('iron_components').insert(iron)
    if (e) return { error: e.message }
  }

  const hardware = payload.hardware
    .filter((h) => h.name || h.description || h.quantity || h.unit)
    .map((h, i) => ({ sku_id: skuId, ...h, serial_no: i + 1, position: i }))
  if (hardware.length) {
    const { error: e } = await supabase.from('hardware_components').insert(hardware)
    if (e) return { error: e.message }
  }

  const p = payload.packaging
  if (p && (p.corrugated_box || p.labels || p.barcode || p.corners)) {
    const { error: e } = await supabase.from('packaging_components').insert({ sku_id: skuId, ...p })
    if (e) return { error: e.message }
  }

  revalidatePath('/skus')
  return { id: skuId }
}

export async function deleteSku(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('skus').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/skus')
  return {}
}
