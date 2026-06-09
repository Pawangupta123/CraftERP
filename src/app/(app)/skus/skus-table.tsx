'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Package, Trash2 } from 'lucide-react'
import { deleteSku } from './actions'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Database } from '@/lib/database.types'

type SkuRow = Pick<
  Database['public']['Tables']['skus']['Row'],
  'id' | 'sku_no' | 'name' | 'photo_url' | 'description'
>

function SkuRowItem({ sku }: { sku: SkuRow }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteSku(sku.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Item deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell>
        <span className="grid size-10 place-items-center overflow-hidden rounded-md border bg-muted/40 text-muted-foreground">
          {sku.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sku.photo_url} alt={sku.name} className="size-full object-cover" />
          ) : (
            <Package className="size-4" />
          )}
        </span>
      </TableCell>
      <TableCell className="font-mono text-xs">{sku.sku_no}</TableCell>
      <TableCell className="font-medium">{sku.name}</TableCell>
      <TableCell className="max-w-sm truncate text-muted-foreground">{sku.description ?? '—'}</TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${sku.name}`}
              disabled={pending}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium text-foreground">{sku.name}</span> and all its
                material details will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}

export function SkusTable({ skus }: { skus: SkuRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">Photo</TableHead>
          <TableHead>SKU No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-0 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skus.map((sku) => (
          <SkuRowItem key={sku.id} sku={sku} />
        ))}
      </TableBody>
    </Table>
  )
}
