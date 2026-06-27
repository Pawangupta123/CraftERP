'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type InwardWoodItem = {
  thickness: number
  width: number
  length: number
  pieces: number
  cft: number
}

export type InwardPayload = {
  po_id: string | null
  date: string | null
  party: string | null
  vehicle_no: string | null
  invoice_no: string | null
  wood_type: string | null
  remark: string | null
  items: InwardWoodItem[]
}

export async function createInward(payload: InwardPayload): Promise<{ error?: string; id?: string }> {
  const items = payload.items.filter((i) => i.pieces > 0)
  if (items.length === 0) return { error: 'Enter pieces in at least one cell.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count } = await supabase.from('inward_entries').select('*', { count: 'exact', head: true })
  const inwardNo = `IN-${String((count ?? 0) + 1).padStart(4, '0')}`

  const totalCft = Math.round(items.reduce((s, i) => s + i.cft, 0) * 100) / 100
  const totalPieces = items.reduce((s, i) => s + i.pieces, 0)

  const { data: entry, error } = await supabase
    .from('inward_entries')
    .insert({
      inward_no: inwardNo,
      po_id: payload.po_id,
      material_type: 'wood',
      date: payload.date ?? new Date().toISOString().slice(0, 10),
      party: payload.party,
      vehicle_no: payload.vehicle_no,
      invoice_no: payload.invoice_no,
      wood_type: payload.wood_type,
      remark: payload.remark,
      total_cft: totalCft,
      total_pieces: totalPieces,
      created_by: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error || !entry) return { error: error?.message ?? 'Could not save inward.' }

  const rows = items.map((i) => ({
    inward_entry_id: entry.id,
    thickness: i.thickness,
    width: i.width,
    length: i.length,
    pieces: i.pieces,
    cft: i.cft,
  }))
  const { error: itemErr } = await supabase.from('inward_wood_items').insert(rows)
  if (itemErr) return { error: itemErr.message }

  revalidatePath('/inward')
  return { id: entry.id }
}

export async function deleteInward(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('inward_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/inward')
  return {}
}
