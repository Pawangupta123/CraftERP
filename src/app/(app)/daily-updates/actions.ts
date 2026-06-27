'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DailyPayload = {
  date: string | null
  po_id: string | null
  sku_id: string | null
  supervisor_name: string | null
  work_done: string | null
  remark: string | null
}

export async function createDailyUpdate(p: DailyPayload): Promise<{ error?: string }> {
  if (!p.work_done && !p.po_id && !p.sku_id && !p.remark) {
    return { error: 'Add at least the work done or a PO/item.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('daily_updates').insert({
    date: p.date || new Date().toISOString().slice(0, 10),
    po_id: p.po_id,
    sku_id: p.sku_id,
    supervisor_name: p.supervisor_name,
    work_done: p.work_done,
    remark: p.remark,
    created_by: user?.id ?? null,
  })
  if (error) return { error: error.message }

  revalidatePath('/daily-updates')
  return {}
}

export async function deleteDailyUpdate(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('daily_updates').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/daily-updates')
  return {}
}
