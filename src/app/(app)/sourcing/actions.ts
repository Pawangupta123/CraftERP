'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SourcingPayload = {
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

export async function saveSourcing(payload: SourcingPayload): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { id, ...fields } = payload

  if (id) {
    const { error } = await supabase.from('sourcing_entries').update(fields).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('sourcing_entries').insert(fields)
    if (error) return { error: error.message }
  }

  revalidatePath('/sourcing')
  return {}
}

export async function deleteSourcing(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('sourcing_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/sourcing')
  return {}
}
