import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardCheck, Plus, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InwardTable, type InwardRow } from './inward-table'

export const metadata: Metadata = { title: 'Inward · CraftERP' }

export default async function InwardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: me } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }
  const isAdmin = me?.role === 'admin'

  const [entriesRes, posRes] = await Promise.all([
    supabase
      .from('inward_entries')
      .select('id, inward_no, date, po_id, material_type, wood_type, total_pieces, total_cft')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('purchase_orders').select('id, po_no'),
  ])

  const poMap = new Map((posRes.data ?? []).map((p) => [p.id, p.po_no]))
  const rows: InwardRow[] = (entriesRes.data ?? []).map((e) => ({
    id: e.id,
    inward_no: e.inward_no,
    date: e.date,
    po_no: e.po_id ? poMap.get(e.po_id) ?? '—' : 'General',
    material_type: e.material_type,
    wood_type: e.wood_type,
    total_pieces: e.total_pieces,
    total_cft: e.total_cft,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Inward</h1>
          <p className="text-sm text-muted-foreground">Material received against purchase orders.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <Button asChild variant="outline">
              <Link href="/inward/status">
                <ClipboardCheck className="size-4" />
                Procurement status
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/inward/material/new">
              <Plus className="size-4" />
              Material inward
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inward/new">
              <Plus className="size-4" />
              New wood inward
            </Link>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Truck className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No inward entries yet.</p>
            <Button asChild variant="outline">
              <Link href="/inward/new">
                <Plus className="size-4" />
                Record your first inward
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <InwardTable rows={rows} />
      )}
    </div>
  )
}
