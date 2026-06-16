import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SourcingGrid } from './sourcing-grid'

export const metadata: Metadata = { title: 'Sourcing · JimiFern' }

export default async function SourcingPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sourcing_entries')
    .select('*')
    .order('created_at', { ascending: true })
  const entries = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Sourcing</h1>
        <p className="text-sm text-muted-foreground">
          Fill the table like a spreadsheet — type in the cells, add rows, then Save.
        </p>
      </div>

      <SourcingGrid key={entries.map((e) => e.id).join(',')} initial={entries} />
    </div>
  )
}
