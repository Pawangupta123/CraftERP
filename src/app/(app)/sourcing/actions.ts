'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SourcingRowInput = {
  id?: string
  item: string | null
  supplier: string | null
  quantity: number | null
  unit: string | null
  rate: number | null
  status: string | null
  date: string | null
  remark: string | null
}

const notEmpty = (r: SourcingRowInput) =>
  Boolean(r.item || r.supplier || r.quantity !== null || r.unit || r.rate !== null || r.status || r.date || r.remark)

/** Save the whole editable grid at once: update existing rows, insert new, delete removed. */
export async function saveAllSourcing(rows: SourcingRowInput[]): Promise<{ error?: string }> {
  const supabase = await createClient()
  const filled = rows.filter(notEmpty)

  const { data: existing } = await supabase.from('sourcing_entries').select('id')
  const existingIds = new Set((existing ?? []).map((e) => e.id))
  const keep = new Set(filled.filter((r) => r.id && existingIds.has(r.id)).map((r) => r.id as string))

  const toDelete = [...existingIds].filter((id) => !keep.has(id))
  if (toDelete.length) {
    const { error } = await supabase.from('sourcing_entries').delete().in('id', toDelete)
    if (error) return { error: error.message }
  }

  for (const r of filled) {
    const { id, ...fields } = r
    if (id && existingIds.has(id)) {
      const { error } = await supabase.from('sourcing_entries').update(fields).eq('id', id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from('sourcing_entries').insert(fields)
      if (error) return { error: error.message }
    }
  }

  revalidatePath('/sourcing')
  return {}
}
