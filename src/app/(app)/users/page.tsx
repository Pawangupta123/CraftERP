import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Plus, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserDialog } from './user-dialog'
import { UsersTable, type ProfileRow } from './users-table'

export const metadata: Metadata = { title: 'Users · CraftERP' }

export default async function UsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (me?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Users</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShieldAlert className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">Access restricted — only admins can manage users.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data } = await supabase.from('profiles').select('id, name, email, role').order('created_at')
  const profiles: ProfileRow[] = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage logins and roles for your team.</p>
        </div>
        <UserDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add user
            </Button>
          }
        />
      </div>
      <UsersTable profiles={profiles} currentUserId={user.id} />
    </div>
  )
}
