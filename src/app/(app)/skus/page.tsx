import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SkusTable } from './skus-table'

export const metadata: Metadata = { title: 'Items (SKU) · CraftERP' }

export default async function SkusPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('skus')
    .select('id, sku_no, name, photo_url, description')
    .order('created_at', { ascending: false })
  const skus = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Items (SKU)</h1>
          <p className="text-sm text-muted-foreground">Products you manufacture, with their material details.</p>
        </div>
        <Button asChild>
          <Link href="/skus/new">
            <Plus className="size-4" />
            New item
          </Link>
        </Button>
      </div>

      {skus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Package className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No items yet.</p>
            <Button asChild variant="outline">
              <Link href="/skus/new">
                <Plus className="size-4" />
                Create your first item
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <SkusTable skus={skus} />
        </div>
      )}
    </div>
  )
}
