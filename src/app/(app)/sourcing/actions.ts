'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/database.types'

export type Vendor = { name: string | null; price: number | null }

export type SourcingRowInput = {
  id?: string
  item: string | null
  price: number | null
  unit: string | null
  vendors: Vendor[]
  remark: string | null
}

const notEmpty = (r: SourcingRowInput) =>
  Boolean(r.item || r.price !== null || r.unit || r.remark || r.vendors.length)

/** Save the whole vendor-comparison grid: update existing rows, insert new, delete removed. */
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
    const fields = {
      item: r.item,
      price: r.price,
      unit: r.unit,
      remark: r.remark,
      vendors: r.vendors as unknown as Json,
    }
    if (r.id && existingIds.has(r.id)) {
      const { error } = await supabase.from('sourcing_entries').update(fields).eq('id', r.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from('sourcing_entries').insert(fields)
      if (error) return { error: error.message }
    }
  }

  revalidatePath('/sourcing')
  return {}
}
