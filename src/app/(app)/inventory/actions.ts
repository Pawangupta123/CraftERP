'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type IssueFormState = { error?: string; ok?: boolean } | null

const num = (v: FormDataEntryValue | null): number | null => {
  const t = String(v ?? '').trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const s = (v: FormDataEntryValue | null): string | null => String(v ?? '').trim() || null

/** Create or update an inventory issue record. */
export async function saveIssue(_prev: IssueFormState, formData: FormData): Promise<IssueFormState> {
  const id = (formData.get('id') as string) || null
  const item_name = String(formData.get('item_name') ?? '').trim()
  if (!item_name) return { error: 'Item name is required.' }

  const date = String(formData.get('date') ?? '').trim() || new Date().toISOString().slice(0, 10)
  const fields = {
    item_name,
    issued_to_name: s(formData.get('issued_to_name')),
    quantity: num(formData.get('quantity')),
    unit: s(formData.get('unit')),
    date,
    remark: s(formData.get('remark')),
  }

  const supabase = await createClient()

  if (id) {
    const { error } = await supabase.from('inventory_issues').update(fields).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('inventory_issues')
      .insert({ ...fields, issued_by: user?.id ?? null })
    if (error) return { error: error.message }
  }

  revalidatePath('/inventory')
  return { ok: true }
}

export async function deleteIssue(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('inventory_issues').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/inventory')
  return {}
}
