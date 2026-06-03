export type UserRole = 'admin' | 'supervisor' | 'store'

export interface AuthUser {
  role: UserRole
  name: string
  email: string
}

export const DEMO_USERS: Array<AuthUser & { password: string }> = [
  { role: 'admin', name: 'Ajay Sharma', email: 'admin@craftexport.com', password: 'admin123' },
  { role: 'supervisor', name: 'Ramesh Kumar', email: 'supervisor@craftexport.com', password: 'super123' },
  { role: 'store', name: 'Mohan Lal', email: 'store@craftexport.com', password: 'store123' },
]

export function login(email: string, password: string): AuthUser | null {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password)
  if (!user) return null
  const { password: _, ...authUser } = user
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_user', JSON.stringify(authUser))
  }
  return authUser
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('erp_user')
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('erp_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
