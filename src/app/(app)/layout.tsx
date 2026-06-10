import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserMenu } from '@/components/layout/user-menu'
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
    <div className="flex h-svh overflow-hidden bg-muted/30 print:h-auto print:overflow-visible">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden print:overflow-visible">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6 print:hidden">
          <MobileNav role={role} />
          <div className="ml-auto">
            <UserMenu name={name} email={email} role={role} />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  )
}
