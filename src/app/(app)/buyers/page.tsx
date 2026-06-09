import type { Metadata } from 'next'
import { Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BuyerFormDialog } from './buyer-form-dialog'
import { BuyersTable } from './buyers-table'

export const metadata: Metadata = { title: 'Buyers · CraftERP' }

export default async function BuyersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('buyers')
    .select('*')
    .order('created_at', { ascending: false })
  const buyers = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Buyers</h1>
          <p className="text-sm text-muted-foreground">Manage your export buyers.</p>
        </div>
        <BuyerFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add buyer
            </Button>
          }
        />
      </div>

      {buyers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Users className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No buyers yet.</p>
            <BuyerFormDialog
              trigger={
                <Button variant="outline">
                  <Plus className="size-4" />
                  Add your first buyer
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <BuyersTable buyers={buyers} />
        </div>
      )}
    </div>
  )
}
