'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type BuyerFormState = { error?: string; ok?: boolean } | null

/** Create a new buyer or update an existing one (when an id is present). */
export async function saveBuyer(
  _prev: BuyerFormState,
  formData: FormData,
): Promise<BuyerFormState> {
  const id = (formData.get('id') as string) || null
  const name = String(formData.get('name') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim() || null
  const country = String(formData.get('country') ?? '').trim() || null

  if (!name) return { error: 'Name is required.' }

  const supabase = await createClient()
  const payload = { name, address, email, country }

  const { error } = id
    ? await supabase.from('buyers').update(payload).eq('id', id)
    : await supabase.from('buyers').insert(payload)

  if (error) return { error: error.message }

  revalidatePath('/buyers')
  return { ok: true }
}

/** Delete a buyer. Returns an error message if the delete is blocked. */
export async function deleteBuyer(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('buyers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/buyers')
  return {}
}
