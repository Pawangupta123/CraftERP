import type { Metadata } from 'next'
import { Boxes } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign in · CraftERP' }

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground/15">
            <Boxes className="size-5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">CraftERP</span>
        </div>

        <div className="max-w-md space-y-3">
          <h1 className="font-heading text-3xl font-semibold leading-tight">
            Handicraft export, end&nbsp;to&nbsp;end.
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            Purchase orders, items, production stages, inventory and payments — all in one
            place. Challan and total CFT calculated automatically.
          </p>
        </div>

        <p className="text-xs text-primary-foreground/70">Internal operations platform</p>

        <Boxes className="pointer-events-none absolute -right-12 -bottom-12 size-72 text-primary-foreground/10" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
                <Boxes className="size-4" />
              </span>
              <span className="font-heading font-semibold tracking-tight">CraftERP</span>
            </div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
