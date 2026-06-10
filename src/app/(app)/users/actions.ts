'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/database.types'

type Role = Database['public']['Enums']['user_role']

/** Returns whether the current caller is an admin, plus their own id. */
async function callerIsAdmin(): Promise<{ ok: boolean; userId: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, userId: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return { ok: profile?.role === 'admin', userId: user.id }
}

export async function createUser(payload: {
  name: string
  email: string
  password: string
  role: Role
}): Promise<{ error?: string }> {
  const { ok } = await callerIsAdmin()
  if (!ok) return { error: 'Not authorized.' }

  const email = payload.email.trim()
  const name = payload.name.trim()
  if (!email || !payload.password) return { error: 'Email and password are required.' }
  if (payload.password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (error || !data.user) return { error: error?.message ?? 'Could not create user.' }

  // A profile row is auto-created by the signup trigger (role 'operator');
  // set the chosen role and name.
  const { error: pErr } = await admin
    .from('profiles')
    .update({ role: payload.role, name })
    .eq('id', data.user.id)
  if (pErr) return { error: pErr.message }

  revalidatePath('/users')
  return {}
}

export async function updateUserRole(userId: string, role: Role): Promise<{ error?: string }> {
  const { ok, userId: callerId } = await callerIsAdmin()
  if (!ok) return { error: 'Not authorized.' }
  if (userId === callerId && role !== 'admin') {
    return { error: 'You cannot remove your own admin access.' }
  }
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/users')
  return {}
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const { ok, userId: callerId } = await callerIsAdmin()
  if (!ok) return { error: 'Not authorized.' }
  if (userId === callerId) return { error: 'You cannot delete your own account.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  revalidatePath('/users')
  return {}
}
