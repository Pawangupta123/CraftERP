'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { navForRole, type Role } from '@/lib/nav'

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = navForRole(role)

  return (
    <div className="flex items-center gap-2 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <DropdownMenuItem
                key={item.href}
                asChild
                className={active ? 'bg-accent text-accent-foreground' : undefined}
              >
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="flex items-center gap-2 font-heading text-[15px] font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-3.5" />
        </span>
        CraftERP
      </span>
    </div>
  )
}
