'use client'

import * as React from 'react'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { saveBuyer, type BuyerFormState } from './actions'
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

type Buyer = Database['public']['Tables']['buyers']['Row']

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string | null
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  )
}

export function BuyerFormDialog({
  buyer,
  trigger,
}: {
  buyer?: Buyer
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<BuyerFormState, FormData>(saveBuyer, null)
  const editing = Boolean(buyer)

  useEffect(() => {
    if (state?.ok) {
      toast.success(editing ? 'Buyer updated' : 'Buyer added')
      setOpen(false)
    }
  }, [state, editing])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit buyer' : 'Add buyer'}</DialogTitle>
          <DialogDescription>Export buyer details. Only name is required.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {buyer ? <input type="hidden" name="id" value={buyer.id} /> : null}

          <Field label="Name" name="name" defaultValue={buyer?.name} required placeholder="Buyer / company name" />
          <Field label="Email" name="email" type="email" defaultValue={buyer?.email} placeholder="buyer@example.com" />
          <Field label="Country" name="country" defaultValue={buyer?.country} placeholder="e.g. United States" />
          <Field label="Address" name="address" defaultValue={buyer?.address} placeholder="Full address" />

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
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Add buyer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
