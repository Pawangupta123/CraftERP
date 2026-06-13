'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type CompanyPayload = {
  name: string | null
  address: string | null
  city: string | null
  gstin: string | null
  website: string | null
  email: string | null
  phone: string | null
}

/** Upsert the single company-settings row. Admin-only via RLS. */
export async function saveCompanySettings(payload: CompanyPayload): Promise<{ error?: string }> {
  const supabase = await createClient()

  const fields = { ...payload, updated_at: new Date().toISOString() }
  const { data: existing } = await supabase.from('company_settings').select('id').limit(1).maybeSingle()

  if (existing) {
    const { error } = await supabase.from('company_settings').update(fields).eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('company_settings').insert(fields)
    if (error) return { error: error.message }
  }

  revalidatePath('/settings')
  return {}
}
