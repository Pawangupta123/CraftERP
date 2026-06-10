'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Update the production stage of a PO line item. */
export async function updateStage(
  lineItemId: string,
  stage: string,
  poId?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const patch = {
    current_stage: stage,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data: updated, error } = await supabase
    .from('stage_tracking')
    .update(patch)
    .eq('po_line_item_id', lineItemId)
    .select('id')

  if (error) return { error: error.message }

  // Safety: seed a row if one doesn't exist yet.
  if (!updated || updated.length === 0) {
    const { error: insErr } = await supabase
      .from('stage_tracking')
      .insert({ po_line_item_id: lineItemId, current_stage: stage, updated_by: user?.id ?? null })
    if (insErr) return { error: insErr.message }
  }

  revalidatePath('/production')
  if (poId) revalidatePath(`/purchase-orders/${poId}`)
  return {}
}
