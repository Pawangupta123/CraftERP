import type { Metadata } from 'next'
import { CreditCard, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PaymentDialog } from './payment-dialog'
import { PaymentsTable } from './payments-table'

export const metadata: Metadata = { title: 'Payments · CraftERP' }

export default async function PaymentsPage() {
  const supabase = await createClient()
  const [paymentsRes, posRes] = await Promise.all([
    supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('purchase_orders').select('id, po_no').order('created_at', { ascending: false }),
  ])
  const payments = paymentsRes.data ?? []
  const pos = posRes.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">Record buyer payments against purchase orders.</p>
        </div>
        <PaymentDialog
          pos={pos}
          trigger={
            <Button>
              <Plus className="size-4" />
              Add payment
            </Button>
          }
        />
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <CreditCard className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            <PaymentDialog
              pos={pos}
              trigger={
                <Button variant="outline">
                  <Plus className="size-4" />
                  Add your first payment
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <PaymentsTable payments={payments} pos={pos} />
      )}
    </div>
  )
}
