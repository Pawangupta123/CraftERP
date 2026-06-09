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
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
          <MobileNav role={role} />
          <div className="ml-auto">
            <UserMenu name={name} email={email} role={role} />
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
