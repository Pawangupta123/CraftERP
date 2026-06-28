import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProcurement } from '@/lib/procurement'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MaterialCell } from '../material-cell'

export const metadata: Metadata = { title: 'Procurement status · CraftERP' }

export default async function InwardStatusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: me } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }
  if (me?.role !== 'admin') redirect('/inward')

  const rows = await getProcurement()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/inward"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to inward
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Procurement status</h1>
        <p className="text-sm text-muted-foreground">
          Per PO: material required (from item BOM × order qty) vs received (inward). Click a PO for details.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">No purchase orders yet.</CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO No.</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Wood (CFT)</TableHead>
                <TableHead>Iron</TableHead>
                <TableHead>Hardware</TableHead>
                <TableHead>Packaging</TableHead>
                <TableHead className="w-0 text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-medium">{r.po_no}</TableCell>
                  <TableCell className="whitespace-nowrap">{r.buyer}</TableCell>
                  <TableCell>
                    <MaterialCell stat={r.wood} />
                  </TableCell>
                  <TableCell>
                    <MaterialCell stat={r.iron} />
                  </TableCell>
                  <TableCell>
                    <MaterialCell stat={r.hardware} />
                  </TableCell>
                  <TableCell>
                    <MaterialCell stat={r.packaging} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/inward/status/${r.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
