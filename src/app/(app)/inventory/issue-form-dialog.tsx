'use client'

import * as React from 'react'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { saveIssue, type IssueFormState } from './actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Database } from '@/lib/database.types'

type Issue = Database['public']['Tables']['inventory_issues']['Row']

const today = () => new Date().toISOString().slice(0, 10)

export function IssueFormDialog({ issue, trigger }: { issue?: Issue; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<IssueFormState, FormData>(saveIssue, null)
  const editing = Boolean(issue)

  useEffect(() => {
    if (state?.ok) {
      toast.success(editing ? 'Issue updated' : 'Item issued')
      setOpen(false)
    }
  }, [state, editing])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit issue' : 'Issue item'}</DialogTitle>
          <DialogDescription>Record material/hardware issued out of the store.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {issue ? <input type="hidden" name="id" value={issue.id} /> : null}

          <div className="space-y-1.5">
            <Label htmlFor="item_name">
              Item name <span className="text-destructive">*</span>
            </Label>
            <Input id="item_name" name="item_name" defaultValue={issue?.item_name} required placeholder="e.g. Brass handle" className="h-9" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="issued_to_name">Issued to</Label>
              <Input id="issued_to_name" name="issued_to_name" defaultValue={issue?.issued_to_name ?? ''} placeholder="Person name" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={issue?.date ?? today()} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" inputMode="decimal" defaultValue={issue?.quantity ?? ''} placeholder="0" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue={issue?.unit ?? ''} placeholder="pcs / kg / m" className="h-9" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="remark">Remark</Label>
            <Input id="remark" name="remark" defaultValue={issue?.remark ?? ''} placeholder="Any note" className="h-9" />
          </div>

          {state?.error ? (
            <p className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Issue item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
