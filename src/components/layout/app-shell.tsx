'use client'

import { useEffect, useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserMenu } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'
import type { Role } from '@/lib/nav'

const STORAGE_KEY = 'sidebar-collapsed'

export function AppShell({
  role,
  name,
  email,
  children,
}: {
  role: Role
  name: string
  email: string
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  // Restore the user's last choice on mount.
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1') {
      setCollapsed(true)
    }
  }, [])

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="flex h-svh overflow-hidden bg-muted/30 print:h-auto print:overflow-visible">
      <Sidebar role={role} collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden print:overflow-visible">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6 print:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
            title={collapsed ? 'Open sidebar' : 'Close sidebar'}
            className="hidden md:inline-flex"
          >
            <PanelLeft className="size-4" />
          </Button>
          <MobileNav role={role} />
          <div className="ml-auto">
            <UserMenu name={name} email={email} role={role} />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
