'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type Currency = Database['public']['Enums']['currency_code']

export type PaymentPayload = {
  id?: string
  po_id: string
  date: string | null
  amount: number | null
  currency: Currency
  conversion_rate: number | null
  percentage: number | null
  container_no: string | null
  remark: string | null
  bl: boolean
  brc: boolean
}

export async function savePayment(payload: PaymentPayload): Promise<{ error?: string }> {
  if (!payload.po_id) return { error: 'Please select a purchase order.' }

  const supabase = await createClient()
  const fields = {
    po_id: payload.po_id,
    date: payload.date,
    amount: payload.amount,
    currency: payload.currency,
    conversion_rate: payload.conversion_rate,
    percentage: payload.percentage,
    container_no: payload.container_no,
    remark: payload.remark,
    bl: payload.bl,
    brc: payload.brc,
  }

  if (payload.id) {
    const { error } = await supabase.from('payments').update(fields).eq('id', payload.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('payments').insert(fields)
    if (error) return { error: error.message }
  }

  revalidatePath('/payments')
  return {}
}

export async function deletePayment(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/payments')
  return {}
}
