import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import type { Role } from '@/lib/nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // Local JWT verification (ES256 signing keys) — no auth-server round-trip per load.
  const { data: claims } = await supabase.auth.getClaims()
  const user = claims?.claims

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.sub)
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
