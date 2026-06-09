import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Factory,
  Warehouse,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

export type Role = Database['public']['Enums']['user_role']

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  /** Roles allowed to see this nav item. */
  roles: Role[]
}

const ALL: Role[] = ['admin', 'operator', 'manager', 'store_manager']

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ALL },
  { label: 'Buyers', href: '/buyers', icon: Users, roles: ['admin'] },
  { label: 'Items (SKU)', href: '/skus', icon: Package, roles: ['admin', 'operator'] },
  { label: 'Purchase Orders', href: '/purchase-orders', icon: FileText, roles: ALL },
  { label: 'Production', href: '/production', icon: Factory, roles: ['admin', 'manager'] },
  { label: 'Inventory', href: '/inventory', icon: Warehouse, roles: ['admin', 'operator', 'store_manager'] },
  { label: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin'] },
]

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  operator: 'Operator',
  manager: 'Manager',
  store_manager: 'Store Manager',
}

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}
