'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DailyRow = {
  po_id: string | null
  sku_id: string | null
  supervisor_name: string | null
  work_done: string | null
  remark: string | null
}

export async function createDailyUpdates(
  date: string,
  rows: DailyRow[],
): Promise<{ error?: string }> {
  const valid = rows.filter((r) => r.po_id || r.sku_id || r.work_done || r.remark)
  if (valid.length === 0) return { error: 'Add at least one update.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const insert = valid.map((r) => ({
    date: date || new Date().toISOString().slice(0, 10),
    po_id: r.po_id,
    sku_id: r.sku_id,
    supervisor_name: r.supervisor_name,
    work_done: r.work_done,
    remark: r.remark,
    created_by: user?.id ?? null,
  }))

  const { error } = await supabase.from('daily_updates').insert(insert)
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
