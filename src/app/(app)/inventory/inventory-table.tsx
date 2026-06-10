'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteIssue } from './actions'
import { IssueFormDialog } from './issue-form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

type Issue = Database['public']['Tables']['inventory_issues']['Row']

function IssueRow({ issue }: { issue: Issue }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteIssue(issue.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Issue deleted')
    })
  }

  return (
    <TableRow className={pending ? 'opacity-50' : undefined}>
      <TableCell className="whitespace-nowrap text-muted-foreground">{issue.date}</TableCell>
      <TableCell className="font-medium">{issue.item_name}</TableCell>
      <TableCell>{issue.issued_to_name ?? '—'}</TableCell>
      <TableCell className="text-right tabular-nums">{issue.quantity ?? '—'}</TableCell>
      <TableCell>{issue.unit ?? '—'}</TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">{issue.remark ?? '—'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <IssueFormDialog
            issue={issue}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Edit issue">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Delete issue" disabled={pending} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this issue?</AlertDialogTitle>
                <AlertDialogDescription>
                  The issue record for <span className="font-medium text-foreground">{issue.item_name}</span> will be
                  permanently deleted.
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
        </div>
      </TableCell>
    </TableRow>
  )
}

export function InventoryTable({ issues }: { issues: Issue[] }) {
  const [item, setItem] = useState('')
  const [person, setPerson] = useState('')
  const [date, setDate] = useState('')

  const shown = issues.filter((r) => {
    const itemOk = !item || r.item_name.toLowerCase().includes(item.toLowerCase())
    const personOk = !person || (r.issued_to_name ?? '').toLowerCase().includes(person.toLowerCase())
    const dateOk = !date || r.date === date
    return itemOk && personOk && dateOk
  })

  const hasFilter = item || person || date

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="f-item" className="text-xs text-muted-foreground">Item name</Label>
          <Input id="f-item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Search item…" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-person" className="text-xs text-muted-foreground">Issued to</Label>
          <Input id="f-person" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Search person…" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-date" className="text-xs text-muted-foreground">Date</Label>
          <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
        </div>
        {hasFilter ? (
          <Button variant="ghost" size="sm" onClick={() => { setItem(''); setPerson(''); setDate('') }}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Issued to</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Remark</TableHead>
              <TableHead className="w-0 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  {hasFilter ? 'No issues match the filters.' : 'No issues recorded.'}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((issue) => <IssueRow key={issue.id} issue={issue} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
