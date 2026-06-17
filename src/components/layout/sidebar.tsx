'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { navForRole, type Role } from '@/lib/nav'

export function Sidebar({
  role,
  collapsed = false,
  onToggle,
}: {
  role: Role
  collapsed?: boolean
  onToggle?: () => void
}) {
  const pathname = usePathname()
  const items = navForRole(role)

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out md:flex print:hidden',
        collapsed ? 'w-0 border-r-0' : 'w-60',
      )}
    >
      <div className="flex h-14 w-60 shrink-0 items-center justify-between border-b px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="JimiFern" className="h-7 w-auto" />
        {onToggle ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        ) : null}
      </div>

      <nav className="w-60 flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="w-60 border-t px-5 py-3 text-xs text-muted-foreground">
        Handicraft Export ERP
      </div>
    </aside>
  )
}
