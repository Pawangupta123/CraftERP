import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsForm, type CompanyInitial } from './settings-form'

export const metadata: Metadata = { title: 'Settings · JimiFern' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (me?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShieldAlert className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">Access restricted — only admins can edit company settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data } = await supabase.from('company_settings').select('*').limit(1).maybeSingle()
  const initial: CompanyInitial = {
    name: data?.name ?? '',
    address: data?.address ?? '',
    city: data?.city ?? '',
    gstin: data?.gstin ?? '',
    website: data?.website ?? '',
    email: data?.email ?? '',
    phone: data?.phone ?? '',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Company details shown on your purchase order invoices.</p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  )
}
