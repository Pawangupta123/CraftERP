'use client'

import { useState } from 'react'
import Link from 'next/link'
import { buyers, supervisors } from '@/lib/mockData'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface SKURow { code: string; name: string; qty: string }

export default function NewPOPage() {
  const [form, setForm] = useState({
    poNumber: `PO-2024-00${Math.floor(Math.random() * 9 + 7)}`,
    buyerId: '',
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    supervisor: '',
    remarks: '',
  })
  const [skus, setSkus] = useState<SKURow[]>([{ code: '', name: '', qty: '' }])
  const [submitted, setSubmitted] = useState(false)

  function addSKU() { setSkus([...skus, { code: '', name: '', qty: '' }]) }
  function removeSKU(i: number) { setSkus(skus.filter((_, idx) => idx !== i)) }
  function updateSKU(i: number, field: keyof SKURow, val: string) {
    setSkus(skus.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.buyerId || !form.deliveryDate || !form.supervisor) {
      toast.error('Please fill all required fields')
      return
    }
    if (skus.some(s => !s.code || !s.name || !s.qty)) {
      toast.error('Please fill all SKU details')
      return
    }
    toast.success('PO created successfully! (Demo)')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <Header title="New Buyer PO" />
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">PO Created!</h2>
          <p className="text-gray-500 text-sm mb-6">{form.poNumber} has been created successfully.</p>
          <div className="flex gap-3">
            <Link href="/pos"><Button variant="outline">View All POs</Button></Link>
            <Link href="/pos"><Button>Go to POs</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="New Buyer PO" subtitle="Create a new purchase order" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/pos"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">PO Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">PO Number</label>
                  <Input value={form.poNumber} onChange={e => setForm({ ...form, poNumber: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Buyer *</label>
                  <select
                    className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.buyerId}
                    onChange={e => setForm({ ...form, buyerId: e.target.value })}
                    required
                  >
                    <option value="">Select buyer...</option>
                    {buyers.map(b => <option key={b.id} value={b.id}>{b.company} ({b.country})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">PO Date *</label>
                  <Input type="date" value={form.poDate} onChange={e => setForm({ ...form, poDate: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Delivery Date *</label>
                  <Input type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Supervisor *</label>
                  <select
                    className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.supervisor}
                    onChange={e => setForm({ ...form, supervisor: e.target.value })}
                    required
                  >
                    <option value="">Assign supervisor...</option>
                    {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Remarks</label>
                  <Input placeholder="Optional notes" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SKUs</p>
                <Button type="button" variant="outline" size="sm" onClick={addSKU}>
                  <Plus className="w-4 h-4" />Add SKU
                </Button>
              </div>
              <div className="space-y-3">
                {skus.map((sku, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="mt-2 text-xs text-gray-400 font-medium w-5 shrink-0">{i + 1}.</span>
                    <Input placeholder="SKU Code (e.g. SKU-001)" value={sku.code} onChange={e => updateSKU(i, 'code', e.target.value)} className="flex-1" />
                    <Input placeholder="SKU Name" value={sku.name} onChange={e => updateSKU(i, 'name', e.target.value)} className="flex-[2]" />
                    <Input type="number" placeholder="Qty (pcs)" value={sku.qty} onChange={e => updateSKU(i, 'qty', e.target.value)} className="w-28" />
                    {skus.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSKU(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/pos"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit">Create Purchase Order</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
