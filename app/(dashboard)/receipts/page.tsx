'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, CheckCircle2, Clock, Search, Package } from 'lucide-react'
import { toast } from 'sonner'

const mockReceipts = [
  { id: 'r1', procPO: 'PROC-001-W', supplier: 'Singh Timber Depot', category: 'Wood', material: 'Teak Wood', qtyOrdered: '5000 CFT', qtyReceived: '5000 CFT', date: '2024-01-22', receivedBy: 'Mohan Lal', status: 'Complete' },
  { id: 'r2', procPO: 'PROC-001-H', supplier: 'Metro Hardware', category: 'Hardware', material: 'Iron Hardware (Hinges)', qtyOrdered: '2000 pcs', qtyReceived: '2000 pcs', date: '2024-01-24', receivedBy: 'Mohan Lal', status: 'Complete' },
  { id: 'r3', procPO: 'PROC-002-W', supplier: 'Singh Timber Depot', category: 'Wood', material: 'Mango Wood', qtyOrdered: '3000 CFT', qtyReceived: '2800 CFT', date: '2024-02-03', receivedBy: 'Mohan Lal', status: 'Partial' },
  { id: 'r4', procPO: 'PROC-002-I', supplier: 'Iron Works Co', category: 'Iron', material: 'Iron Rods', qtyOrdered: '500 kg', qtyReceived: '500 kg', date: '2024-02-06', receivedBy: 'Mohan Lal', status: 'Complete' },
  { id: 'r5', procPO: 'PROC-003-W', supplier: 'Green Bamboo Traders', category: 'Wood', material: 'Bamboo', qtyOrdered: '2000 kg', qtyReceived: '—', date: '—', receivedBy: '—', status: 'Pending' },
  { id: 'r6', procPO: 'PROC-001-P', supplier: 'PackBox India', category: 'Packaging', material: 'Corrugated Boxes', qtyOrdered: '1000 pcs', qtyReceived: '—', date: '—', receivedBy: '—', status: 'Pending' },
]

export default function ReceiptsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ procPO: '', material: '', category: 'Wood', qtyReceived: '', remarks: '' })

  const filtered = mockReceipts.filter(r =>
    r.procPO.toLowerCase().includes(search.toLowerCase()) ||
    r.material.toLowerCase().includes(search.toLowerCase()) ||
    r.supplier.toLowerCase().includes(search.toLowerCase())
  )

  const complete = mockReceipts.filter(r => r.status === 'Complete').length
  const partial = mockReceipts.filter(r => r.status === 'Partial').length
  const pending = mockReceipts.filter(r => r.status === 'Pending').length

  function handleReceive(e: React.FormEvent) {
    e.preventDefault()
    toast.success(`Material received: ${form.material} — ${form.qtyReceived} (Demo)`)
    setShowForm(false)
    setForm({ procPO: '', material: '', category: 'Wood', qtyReceived: '', remarks: '' })
  }

  return (
    <div>
      <Header title="Material Receipts" subtitle="Record incoming materials from suppliers" />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Fully Received', count: complete, color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
            { label: 'Partial Receipt', count: partial, color: 'bg-amber-100 text-amber-700', icon: Package },
            { label: 'Awaiting Receipt', count: pending, color: 'bg-gray-100 text-gray-600', icon: Clock },
          ].map(({ label, count, color, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Receive material form */}
        {showForm && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Record Material Receipt</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleReceive} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Procurement PO No. *</label>
                  <Input placeholder="e.g. PROC-001-W" value={form.procPO} onChange={e => setForm({ ...form, procPO: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Material Name *</label>
                  <Input placeholder="e.g. Teak Wood" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {['Wood', 'Hardware', 'Iron', 'Packaging', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity Received *</label>
                  <Input placeholder="e.g. 500 CFT" value={form.qtyReceived} onChange={e => setForm({ ...form, qtyReceived: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                  <Input placeholder="Any notes..." value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
                <div className="col-span-2 flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm">Save Receipt</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search PO, material, supplier..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />Receive Material
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Proc. PO', 'Supplier', 'Material', 'Category', 'Qty Ordered', 'Qty Received', 'Date', 'Received By', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{r.procPO}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.supplier}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.material}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.category}</span></td>
                      <td className="px-4 py-3 text-gray-600">{r.qtyOrdered}</td>
                      <td className="px-4 py-3 text-gray-600">{r.qtyReceived}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{r.date !== '—' ? new Date(r.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.receivedBy}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === 'Complete' ? 'bg-green-100 text-green-700'
                          : r.status === 'Partial' ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
