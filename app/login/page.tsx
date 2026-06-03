'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { login, DEMO_USERS } from '@/lib/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Boxes, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  function fillDemo(role: 'admin' | 'supervisor' | 'store') {
    const user = DEMO_USERS.find(u => u.role === role)
    if (user) { setEmail(user.email); setPassword(user.password) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const user = login(email, password)
    if (!user) {
      toast.error('Invalid email or password')
      setLoading(false)
      return
    }
    toast.success(`Welcome, ${user.name}!`)
    router.push('/dashboard')
  }

  const roleCards = [
    { role: 'admin' as const, label: 'Admin', desc: 'Full system access', color: 'border-indigo-300 bg-indigo-50 hover:border-indigo-400', dot: 'bg-indigo-500' },
    { role: 'supervisor' as const, label: 'Supervisor', desc: 'Production tracking', color: 'border-amber-300 bg-amber-50 hover:border-amber-400', dot: 'bg-amber-500' },
    { role: 'store' as const, label: 'Store Manager', desc: 'Inventory & materials', color: 'border-green-300 bg-green-50 hover:border-green-400', dot: 'bg-green-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="text-white hidden md:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CraftERP</h1>
              <p className="text-indigo-300 text-sm">Handicraft Export Management</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-snug mb-4">
            Complete lifecycle tracking<br />for your export orders
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            From Buyer PO creation to BRC filing — manage procurement, production, dispatch, and payments in one place.
          </p>
          <div className="space-y-3">
            {['Buyer PO to BRC lifecycle', 'Role-based access control', 'Production stage tracking', 'Inventory & material management'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CraftERP</h1>
              <p className="text-gray-500 text-xs">Handicraft Export Management</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">Sign in</h3>
          <p className="text-gray-500 text-sm mb-6">Use demo credentials below</p>

          {/* Demo role quick-fill */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roleCards.map(({ role, label, desc, color, dot }) => (
              <button
                key={role}
                type="button"
                onClick={() => fillDemo(role)}
                className={cn('border-2 rounded-xl p-3 text-left transition-all cursor-pointer', color)}
              >
                <div className={cn('w-2 h-2 rounded-full mb-1.5', dot)} />
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center">Demo credentials auto-filled on card click</p>
          </div>
        </div>
      </div>
    </div>
  )
}
