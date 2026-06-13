import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign in · JimiFern' }

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        {/* JF monogram watermark — on-brand, sits behind the content */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-monogram.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -bottom-20 size-96 opacity-[0.07] brightness-0 invert"
        />

        <div className="relative inline-flex w-fit rounded-xl bg-white px-4 py-2.5 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="JimiFern" className="h-7 w-auto" />
        </div>

        <div className="relative max-w-md space-y-3">
          <h1 className="font-heading text-3xl font-semibold leading-tight">
            Handicraft export, end&nbsp;to&nbsp;end.
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            Purchase orders, items, production stages, inventory and payments — all in one
            place. Total CBM and buyer invoices generated automatically.
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/70">Internal operations platform</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="JimiFern" className="h-7 w-auto lg:hidden" />
            <h2 className="font-heading text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
