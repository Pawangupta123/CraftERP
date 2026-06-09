'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteBuyer } from './actions'
import { BuyerFormDialog } from './buyer-form-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Database } from '@/lib/database.types'

type Buyer = Database['public']['Tables']['buyers']['Row']

function BuyerRow({ buyer }: { buyer: Buyer }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Delete buyer "${buyer.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteBuyer(buyer.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Buyer deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="font-medium">{buyer.name}</TableCell>
      <TableCell className="text-muted-foreground">{buyer.email ?? '—'}</TableCell>
      <TableCell>{buyer.country ?? '—'}</TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">{buyer.address ?? '—'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <BuyerFormDialog
            buyer={buyer}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Edit ${buyer.name}`}>
                <Pencil className="size-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${buyer.name}`}
            disabled={pending}
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function BuyersTable({ buyers }: { buyers: Buyer[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="w-0 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyers.map((buyer) => (
          <BuyerRow key={buyer.id} buyer={buyer} />
        ))}
      </TableBody>
    </Table>
  )
}
