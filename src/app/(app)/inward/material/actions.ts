'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type MaterialRow = {
  sku_id: string | null
  name: string | null
  description: string | null
  section: string | null
  length: number | null
  width: number | null
  qty: number | null
  unit: string | null
  remark: string | null
}

export type MaterialInwardPayload = {
  material_type: string
  po_id: string | null
  date: string | null
  party: string | null
  vehicle_no: string | null
  invoice_no: string | null
  remark: string | null
  rows: MaterialRow[]
}

export async function createMaterialInward(
  payload: MaterialInwardPayload,
): Promise<{ error?: string; id?: string }> {
  const rows = payload.rows.filter(
    (r) => r.name || r.description || r.section || r.qty || r.length || r.width,
  )
  if (rows.length === 0) return { error: 'Add at least one row.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count } = await supabase.from('inward_entries').select('*', { count: 'exact', head: true })
  const inwardNo = `IN-${String((count ?? 0) + 1).padStart(4, '0')}`
  const totalQty = rows.reduce((s, r) => s + (r.qty ?? 0), 0)

  const { data: entry, error } = await supabase
    .from('inward_entries')
    .insert({
      inward_no: inwardNo,
      po_id: payload.po_id,
      material_type: payload.material_type,
      date: payload.date ?? new Date().toISOString().slice(0, 10),
      party: payload.party,
      vehicle_no: payload.vehicle_no,
      invoice_no: payload.invoice_no,
      remark: payload.remark,
      total_cft: 0,
      total_pieces: totalQty,
      created_by: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error || !entry) return { error: error?.message ?? 'Could not save inward.' }

  const itemRows = rows.map((r, i) => ({ inward_entry_id: entry.id, ...r, position: i }))
  const { error: rowErr } = await supabase.from('inward_rows').insert(itemRows)
  if (rowErr) return { error: rowErr.message }

  revalidatePath('/inward')
  return { id: entry.id }
}
