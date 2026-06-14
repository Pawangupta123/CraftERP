'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { nextSeq } from '@/lib/next-seq'
import type { Database } from '@/lib/database.types'

type POStatus = Database['public']['Enums']['po_status']

export type POPayload = {
  po_no: string
  buyer_id: string
  photo_url: string | null
  delivery_date: string | null
  inspection_date: string | null
  shipping_country: string | null
  brc: boolean
  brc_deadline: string | null
  status: POStatus
  line_items: { id?: string; sku_id: string; quantity: number; stage: string | null }[]
}

export async function createPO(payload: POPayload): Promise<{ error?: string; id?: string }> {
  if (!payload.buyer_id) return { error: 'Please select a buyer.' }
  const items = payload.line_items.filter((l) => l.sku_id)
  if (items.length === 0) return { error: 'Add at least one item.' }

  const supabase = await createClient()

  const manualPoNo = payload.po_no.trim()
  let poNo = manualPoNo
  if (!poNo) {
    const { data: existing } = await supabase.from('purchase_orders').select('po_no')
    poNo = nextSeq((existing ?? []).map((r) => r.po_no), 'PO')
  }

  const header = {
    buyer_id: payload.buyer_id,
    photo_url: payload.photo_url,
    delivery_date: payload.delivery_date,
    inspection_date: payload.inspection_date,
    shipping_country: payload.shipping_country,
    brc: payload.brc,
    brc_deadline: payload.brc_deadline,
    status: payload.status,
  }

  // Insert; if an auto-generated number collides (e.g. a deletion left a gap, or a race),
  // recompute and retry. A manual duplicate returns a clear message.
  let po: { id: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({ po_no: poNo, ...header })
      .select('id')
      .single()
    if (data && !error) {
      po = data
      break
    }
    if (error?.code === '23505') {
      if (manualPoNo) return { error: `PO number "${poNo}" already exists. Choose a different one.` }
      const { data: existing } = await supabase.from('purchase_orders').select('po_no')
      poNo = nextSeq((existing ?? []).map((r) => r.po_no), 'PO')
      continue
    }
    return { error: error?.message ?? 'Could not create PO.' }
  }
  if (!po) return { error: 'Could not generate a unique PO number, please try again.' }

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

  // Seed one stage-tracking row per line item with the stage chosen on the form.
  if (inserted && inserted.length) {
    const stages = inserted.map((row, i) => ({ po_line_item_id: row.id, current_stage: items[i]?.stage ?? null }))
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
    shipping_country: payload.shipping_country,
    brc: payload.brc,
    brc_deadline: payload.brc_deadline,
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
      // Keep the SKU's production stage in sync with the form selection.
      const { data: st } = await supabase
        .from('stage_tracking')
        .select('id')
        .eq('po_line_item_id', l.id)
        .maybeSingle()
      if (st) {
        await supabase
          .from('stage_tracking')
          .update({ current_stage: l.stage, updated_at: new Date().toISOString() })
          .eq('id', st.id)
      } else {
        await supabase.from('stage_tracking').insert({ po_line_item_id: l.id, current_stage: l.stage })
      }
    } else {
      const { data: ins } = await supabase
        .from('po_line_items')
        .insert({ po_id: id, sku_id: l.sku_id, quantity: l.quantity, position: i })
        .select('id')
        .single()
      if (ins) {
        await supabase.from('stage_tracking').insert({ po_line_item_id: ins.id, current_stage: l.stage })
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

/** Set the current production stage for one SKU line on a PO (null = not started). */
export async function updateLineItemStage(
  poId: string,
  lineItemId: string,
  stage: string | null,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('stage_tracking')
    .select('id')
    .eq('po_line_item_id', lineItemId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('stage_tracking')
      .update({ current_stage: stage, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('stage_tracking')
      .insert({ po_line_item_id: lineItemId, current_stage: stage })
    if (error) return { error: error.message }
  }

  revalidatePath('/purchase-orders')
  revalidatePath(`/purchase-orders/${poId}`)
  return {}
}

export async function deletePO(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/purchase-orders')
  return {}
}
