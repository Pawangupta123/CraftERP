'use client'

import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/login/actions'
import { ROLE_LABEL, type Role } from '@/lib/nav'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UserMenu({ name, email, role }: { name: string; email: string; role: Role }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg" className="h-9 gap-2 px-1.5">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-primary">{initials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-medium text-foreground">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{email}</div>
          <Badge variant="secondary" className="mt-1.5">
            {ROLE_LABEL[role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive transition-colors outline-hidden hover:bg-destructive/10 focus-visible:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
