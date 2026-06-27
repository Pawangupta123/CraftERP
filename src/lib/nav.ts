import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Warehouse,
  CreditCard,
  UserCog,
  Settings,
  ShoppingBag,
  ClipboardList,
  Truck,
  NotebookPen,
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

const ALL: Role[] = ['admin', 'operator', 'manager', 'store_manager', 'supervisor']

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ALL },
  { label: 'Buyers', href: '/buyers', icon: Users, roles: ['admin'] },
  { label: 'Items (SKU)', href: '/skus', icon: Package, roles: ['admin'] },
  { label: 'Purchase Orders', href: '/purchase-orders', icon: FileText, roles: ALL },
  { label: 'Procurement', href: '/procurement', icon: ClipboardList, roles: ['admin'] },
  { label: 'Inward', href: '/inward', icon: Truck, roles: ['admin', 'operator'] },
  { label: 'Daily Updates', href: '/daily-updates', icon: NotebookPen, roles: ['admin', 'supervisor'] },
  { label: 'Sourcing', href: '/sourcing', icon: ShoppingBag, roles: ['admin'] },
  { label: 'Inventory', href: '/inventory', icon: Warehouse, roles: ['admin', 'operator', 'store_manager'] },
  { label: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin'] },
  { label: 'Users', href: '/users', icon: UserCog, roles: ['admin'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
]

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  operator: 'Operator',
  manager: 'Manager',
  store_manager: 'Store Manager',
  supervisor: 'Supervisor',
}

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}
