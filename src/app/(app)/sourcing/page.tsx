import type { Metadata } from 'next'
import { Plus, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SourcingDialog } from './sourcing-dialog'
import { SourcingTable } from './sourcing-table'

export const metadata: Metadata = { title: 'Sourcing · JimiFern' }

export default async function SourcingPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sourcing_entries')
    .select('*')
    .order('created_at', { ascending: false })
  const entries = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Sourcing</h1>
          <p className="text-sm text-muted-foreground">Materials to source and their suppliers.</p>
        </div>
        <SourcingDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add entry
            </Button>
          }
        />
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No sourcing entries yet.</p>
            <SourcingDialog
              trigger={
                <Button variant="outline">
                  <Plus className="size-4" />
                  Add your first entry
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <SourcingTable entries={entries} />
      )}
    </div>
  )
}
