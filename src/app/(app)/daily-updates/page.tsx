import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DailyDialog } from './daily-dialog'
import { DailyTable, type DailyRow } from './daily-table'

export const metadata: Metadata = { title: 'Daily Updates · CraftERP' }

export default async function DailyUpdatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [posRes, skusRes, updatesRes] = await Promise.all([
    supabase.from('purchase_orders').select('id, po_no').order('created_at', { ascending: false }),
    supabase.from('skus').select('id, sku_no, name').order('sku_no'),
    supabase
      .from('daily_updates')
      .select('id, date, po_id, sku_id, supervisor_name, work_done, remark')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  let defaultName = ''
  if (user) {
    const { data: me } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle()
    defaultName = me?.name ?? ''
  }

  const poMap = new Map((posRes.data ?? []).map((p) => [p.id, p.po_no]))
  const skuMap = new Map((skusRes.data ?? []).map((s) => [s.id, `${s.sku_no} — ${s.name}`]))
  const rows: DailyRow[] = (updatesRes.data ?? []).map((u) => ({
    id: u.id,
    date: u.date,
    po_no: u.po_id ? poMap.get(u.po_id) ?? '—' : '—',
    sku_label: u.sku_id ? skuMap.get(u.sku_id) ?? '—' : '—',
    supervisor_name: u.supervisor_name,
    work_done: u.work_done,
    remark: u.remark,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Daily Updates</h1>
          <p className="text-sm text-muted-foreground">Daily work logged per PO / item. Filter by date to review a day.</p>
        </div>
        <DailyDialog
          pos={posRes.data ?? []}
          skus={skusRes.data ?? []}
          defaultName={defaultName}
          trigger={
            <Button>
              <Plus className="size-4" />
              Add update
            </Button>
          }
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">No updates yet.</CardContent>
        </Card>
      ) : (
        <DailyTable rows={rows} />
      )}
    </div>
  )
}
