'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type POStatus = Database['public']['Enums']['po_status']

export type POPayload = {
  po_no: string
  buyer_id: string
  photo_url: string | null
  delivery_date: string | null
  inspection_date: string | null
  shipping_date: string | null
  shipping_country: string | null
  status: POStatus
  line_items: { id?: string; sku_id: string; quantity: number }[]
}

export async function createPO(payload: POPayload): Promise<{ error?: string; id?: string }> {
  if (!payload.buyer_id) return { error: 'Please select a buyer.' }
  const items = payload.line_items.filter((l) => l.sku_id)
  if (items.length === 0) return { error: 'Add at least one item.' }

  const supabase = await createClient()

  let poNo = payload.po_no.trim()
  if (!poNo) {
    const { count } = await supabase.from('purchase_orders').select('*', { count: 'exact', head: true })
    poNo = `PO-${String((count ?? 0) + 1).padStart(4, '0')}`
  }

  const { data: po, error } = await supabase
    .from('purchase_orders')
    .insert({
      po_no: poNo,
      buyer_id: payload.buyer_id,
      photo_url: payload.photo_url,
      delivery_date: payload.delivery_date,
      inspection_date: payload.inspection_date,
      shipping_date: payload.shipping_date,
      shipping_country: payload.shipping_country,
      status: payload.status,
    })
    .select('id')
    .single()

  if (error || !po) return { error: error?.message ?? 'Could not create PO.' }

  const lineRows = items.map((l, i) => ({
    po_id: po.id,
    sku_id: l.sku_id,
    quantity: l.quantity,
    position: i,
  }))
  const { data: inserted, error: liErr } = await supabase
    .from('po_line_items')
    .insert(lineRows)
    .select('id')
  if (liErr) return { error: liErr.message }

  // Seed one stage-tracking row per line item; the Production module updates these later.
  if (inserted && inserted.length) {
    const stages = inserted.map((row) => ({ po_line_item_id: row.id, current_stage: 'Pending' }))
    await supabase.from('stage_tracking').insert(stages)
  }

  revalidatePath('/purchase-orders')
  return { id: po.id }
}

export async function updatePO(id: string, payload: POPayload): Promise<{ error?: string }> {
  if (!payload.buyer_id) return { error: 'Please select a buyer.' }
  const incoming = payload.line_items.filter((l) => l.sku_id)
  if (incoming.length === 0) return { error: 'Add at least one item.' }

  const supabase = await createClient()

  const header: Database['public']['Tables']['purchase_orders']['Update'] = {
    buyer_id: payload.buyer_id,
    photo_url: payload.photo_url,
    delivery_date: payload.delivery_date,
    inspection_date: payload.inspection_date,
    shipping_date: payload.shipping_date,
    shipping_country: payload.shipping_country,
    status: payload.status,
  }
  if (payload.po_no.trim()) header.po_no = payload.po_no.trim()

  const { error } = await supabase.from('purchase_orders').update(header).eq('id', id)
  if (error) return { error: error.message }

  // Reconcile line items so existing rows (and their production stages) are preserved.
  const { data: existing } = await supabase.from('po_line_items').select('id').eq('po_id', id)
  const existingIds = new Set((existing ?? []).map((r) => r.id))
  const keepIds = new Set(incoming.filter((l) => l.id && existingIds.has(l.id)).map((l) => l.id as string))

  const toDelete = [...existingIds].filter((eid) => !keepIds.has(eid))
  if (toDelete.length) {
    await supabase.from('po_line_items').delete().in('id', toDelete) // stage_tracking cascades
  }

  for (let i = 0; i < incoming.length; i++) {
    const l = incoming[i]
    if (l.id && existingIds.has(l.id)) {
      await supabase
        .from('po_line_items')
        .update({ sku_id: l.sku_id, quantity: l.quantity, position: i })
        .eq('id', l.id)
    } else {
      const { data: ins } = await supabase
        .from('po_line_items')
        .insert({ po_id: id, sku_id: l.sku_id, quantity: l.quantity, position: i })
        .select('id')
        .single()
      if (ins) {
        await supabase.from('stage_tracking').insert({ po_line_item_id: ins.id, current_stage: 'Pending' })
      }
    }
  }

  revalidatePath('/purchase-orders')
  revalidatePath(`/purchase-orders/${id}`)
  return {}
}

export async function updatePOStatus(id: string, status: POStatus): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/purchase-orders')
  revalidatePath(`/purchase-orders/${id}`)
  return {}
}

export async function deletePO(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/purchase-orders')
  return {}
}
