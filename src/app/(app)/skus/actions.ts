'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type DB = Awaited<ReturnType<typeof createClient>>

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

/** Inserts the material component rows for a SKU. Returns an error message or null. */
async function insertComponents(supabase: DB, skuId: string, payload: SkuPayload): Promise<string | null> {
  const wood = payload.wood
    .filter((w) => w.description || w.length || w.thickness || w.breadth || w.quantity)
    .map((w, i) => ({ sku_id: skuId, ...w, position: i }))
  if (wood.length) {
    const { error } = await supabase.from('wood_components').insert(wood)
    if (error) return error.message
  }

  const iron = payload.iron
    .filter((x) => x.description || x.section || x.length || x.width || x.remark)
    .map((x, i) => ({ sku_id: skuId, ...x, position: i }))
  if (iron.length) {
    const { error } = await supabase.from('iron_components').insert(iron)
    if (error) return error.message
  }

  const hardware = payload.hardware
    .filter((h) => h.name || h.description || h.quantity || h.unit)
    .map((h, i) => ({ sku_id: skuId, ...h, serial_no: i + 1, position: i }))
  if (hardware.length) {
    const { error } = await supabase.from('hardware_components').insert(hardware)
    if (error) return error.message
  }

  const p = payload.packaging
  if (p && (p.corrugated_box || p.labels || p.barcode || p.corners)) {
    const { error } = await supabase.from('packaging_components').insert({ sku_id: skuId, ...p })
    if (error) return error.message
  }

  return null
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

  if (error || !sku) return { error: error?.message ?? 'Could not create item.' }

  const err = await insertComponents(supabase, sku.id, payload)
  if (err) return { error: err }

  revalidatePath('/skus')
  return { id: sku.id }
}

export async function updateSku(id: string, payload: SkuPayload): Promise<{ error?: string }> {
  const name = payload.name.trim()
  if (!name) return { error: 'Item name is required.' }

  const supabase = await createClient()

  const update: Database['public']['Tables']['skus']['Update'] = {
    name,
    photo_url: payload.photo_url,
    description: payload.description,
    remark: payload.remark,
  }
  if (payload.sku_no.trim()) update.sku_no = payload.sku_no.trim()

  const { error } = await supabase.from('skus').update(update).eq('id', id)
  if (error) return { error: error.message }

  // Replace all component rows with the submitted set.
  await supabase.from('wood_components').delete().eq('sku_id', id)
  await supabase.from('iron_components').delete().eq('sku_id', id)
  await supabase.from('hardware_components').delete().eq('sku_id', id)
  await supabase.from('packaging_components').delete().eq('sku_id', id)

  const err = await insertComponents(supabase, id, payload)
  if (err) return { error: err }

  revalidatePath('/skus')
  revalidatePath(`/skus/${id}/edit`)
  return {}
}

export async function deleteSku(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('skus').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/skus')
  return {}
}
