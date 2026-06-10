'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Printer } from 'lucide-react'
import { updatePOStatus } from './actions'
import { PO_STATUS, PO_STATUS_ORDER, type POStatus } from '@/lib/po-status'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="size-4" />
      Print / PDF
    </Button>
  )
}

export function StatusControl({ id, status }: { id: string; status: POStatus }) {
  const [pending, startTransition] = useTransition()

  function onChange(value: string) {
    startTransition(async () => {
      const res = await updatePOStatus(id, value as POStatus)
      if (res?.error) toast.error(res.error)
      else toast.success('Status updated')
    })
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-9 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PO_STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {PO_STATUS[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
