import type { Database } from '@/lib/database.types'

export type POStatus = Database['public']['Enums']['po_status']

export const PO_STATUS: Record<POStatus, { label: string; badge: string; dot: string }> = {
  upcoming: { label: 'Upcoming', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-600' },
}

export const PO_STATUS_ORDER: POStatus[] = ['upcoming', 'in_progress', 'completed']
