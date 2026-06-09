import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SkuForm } from '../sku-form'

export const metadata: Metadata = { title: 'New item · CraftERP' }

export default function NewSkuPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/skus"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to items
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">New item</h1>
      </div>
      <SkuForm />
    </div>
  )
}
