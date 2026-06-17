import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import type { Role } from '@/lib/nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  const role: Role = profile?.role ?? 'operator'
  const name = profile?.name ?? user.email ?? 'User'
  const email = profile?.email ?? user.email ?? ''

  return (
    <AppShell role={role} name={name} email={email}>
      {children}
    </AppShell>
  )
}
