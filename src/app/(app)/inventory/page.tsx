import type { Metadata } from 'next'
import { Plus, Warehouse } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IssueFormDialog } from './issue-form-dialog'
import { InventoryTable } from './inventory-table'

export const metadata: Metadata = { title: 'Inventory · CraftERP' }

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('inventory_issues')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  const issues = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track items issued from the store.</p>
        </div>
        <IssueFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Issue item
            </Button>
          }
        />
      </div>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Warehouse className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No items issued yet.</p>
            <IssueFormDialog
              trigger={
                <Button variant="outline">
                  <Plus className="size-4" />
                  Issue your first item
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <InventoryTable issues={issues} />
      )}
    </div>
  )
}
