'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteUser, updateUserRole } from './actions'
import { ROLE_LABEL, type Role } from '@/lib/nav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type ProfileRow = {
  id: string
  name: string | null
  email: string | null
  role: Role
}

const ROLES: Role[] = ['admin', 'operator', 'manager', 'store_manager']

function initials(text: string) {
  return text.trim().slice(0, 2).toUpperCase()
}

function RoleSelect({ userId, role, disabled }: { userId: string; role: Role; disabled: boolean }) {
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState<Role>(role)

  function onChange(v: string) {
    const prev = value
    setValue(v as Role)
    startTransition(async () => {
      const res = await updateUserRole(userId, v as Role)
      if (res?.error) {
        toast.error(res.error)
        setValue(prev)
      } else {
        toast.success('Role updated')
      }
    })
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || pending}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABEL[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function UserRow({ profile, isSelf }: { profile: ProfileRow; isSelf: boolean }) {
  const [pending, startTransition] = useTransition()
  const display = profile.name || profile.email || 'User'

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteUser(profile.id)
      if (res?.error) toast.error(res.error)
      else toast.success('User deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-primary">{initials(display)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {display}
            {isSelf ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(You)</span> : null}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{profile.email ?? '—'}</TableCell>
      <TableCell>
        <RoleSelect userId={profile.id} role={profile.role} disabled={isSelf} />
      </TableCell>
      <TableCell className="text-right">
        {isSelf ? (
          <span className="pr-2 text-xs text-muted-foreground">—</span>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Delete ${display}`} disabled={pending} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium text-foreground">{display}</span> will lose access and their
                  login will be removed. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  )
}

export function UsersTable({ profiles, currentUserId }: { profiles: ProfileRow[]; currentUserId: string }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-0 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <UserRow key={p.id} profile={p} isSelf={p.id === currentUserId} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
