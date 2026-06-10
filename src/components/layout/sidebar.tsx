'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navForRole, type Role } from '@/lib/nav'

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = navForRole(role)

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex print:hidden">
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-4" />
        </span>
        <span className="font-heading text-[15px] font-semibold tracking-tight">CraftERP</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
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

      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Handicraft Export ERP
      </div>
    </aside>
  )
}
