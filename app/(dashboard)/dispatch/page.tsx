'use client'

import { useState } from 'react'
import Link from 'next/link'
import { buyerPOs, getBuyer, getStatusColor, type POStatus } from '@/lib/mockData'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Truck, FileText, CreditCard, CheckCircle2, Clock,
  Search, ChevronRight, Edit, AlertCircle, Package
} from 'lucide-react'
import { toast } from 'sonner'

const DISPATCH_STATUSES: POStatus[] = ['Dispatched', 'Awaiting BL', 'Awaiting Payment', 'Awaiting BRC', 'Closed']

export default function DispatchPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<POStatus | 'All'>('All')
  const [editingPO, setEditingPO] = useState<string | null>(null)
  const [blForm, setBlForm] = useState({ blNumber: '', blDate: '', paymentStatus: '', paymentDate: '', brcStatus: '' })

  const dispatchedPOs = buyerPOs.filter(po =>
    ['Dispatched', 'Awaiting BL', 'Awaiting Payment', 'Awaiting BRC', 'Closed'].includes(po.status)
  )

  const filtered = dispatchedPOs.filter(po => {
    const buyer = getBuyer(po.buyerId)
    const matchSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      buyer?.company.toLowerCase().includes(search.toLowerCase()) || ''
    const matchStatus = filterStatus === 'All' || po.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    dispatched: buyerPOs.filter(p => p.status === 'Dispatched').length,
    awaitingBL: buyerPOs.filter(p => p.status === 'Awaiting BL').length,
    awaitingPayment: buyerPOs.filter(p => p.status === 'Awaiting Payment').length,
    awaitingBRC: buyerPOs.filter(p => p.status === 'Awaiting BRC').length,
    closed: buyerPOs.filter(p => p.status === 'Closed').length,
  }

  function openEdit(po: typeof buyerPOs[0]) {
    setEditingPO(po.id)
    setBlForm({
      blNumber: po.blNumber || '',
      blDate: po.blDate || '',
      paymentStatus: po.paymentStatus || '',
      paymentDate: po.paymentDate || '',
      brcStatus: po.brcStatus || '',
    })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Dispatch details updated! (Demo)')
    setEditingPO(null)
  }

  const getLifecycleStep = (status: POStatus) => {
    const steps = ['Dispatched', 'Awaiting BL', 'Awaiting Payment', 'Awaiting BRC', 'Closed']
    return steps.indexOf(status)
  }

  return (
    <div>
      <Header title="Dispatch & BL" subtitle="Track dispatched orders, BL, payments and BRC" />
      <div className="p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Dispatched', count: stats.dispatched, icon: Truck, color: 'bg-purple-100 text-purple-700', status: 'Dispatched' as POStatus },
            { label: 'Awaiting BL', count: stats.awaitingBL, icon: FileText, color: 'bg-orange-100 text-orange-700', status: 'Awaiting BL' as POStatus },
            { label: 'Awaiting Payment', count: stats.awaitingPayment, icon: CreditCard, color: 'bg-red-100 text-red-700', status: 'Awaiting Payment' as POStatus },
            { label: 'Awaiting BRC', count: stats.awaitingBRC, icon: AlertCircle, color: 'bg-pink-100 text-pink-700', status: 'Awaiting BRC' as POStatus },
            { label: 'Closed', count: stats.closed, icon: CheckCircle2, color: 'bg-green-100 text-green-700', status: 'Closed' as POStatus },
          ].map(({ label, count, icon: Icon, color, status }) => (
            <button
              key={label}
              onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${filterStatus === status ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-gray-600 leading-tight">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{count}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search PO, buyer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* PO list */}
        <div className="space-y-3">
          {filtered.map(po => {
            const buyer = getBuyer(po.buyerId)
            const stepIdx = getLifecycleStep(po.status)
            const steps = ['Dispatched', 'BL Received', 'Payment Done', 'BRC Filed', 'Closed']
            const isEditing = editingPO === po.id

            return (
              <Card key={po.id} className={isEditing ? 'border-indigo-300 shadow-md' : 'hover:shadow-sm transition-shadow'}>
                <CardContent className="pt-4 pb-4">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-gray-900">{po.poNumber}</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        <span>{buyer?.company} · {buyer?.country}</span>
                        <span>{po.skus.length} SKUs</span>
                        <span>Delivery: {new Date(po.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/pos/${po.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">View PO <ChevronRight className="w-3 h-3 ml-1" /></Button>
                      </Link>
                      {!isEditing && (
                        <Button size="sm" variant="outline" onClick={() => openEdit(po)}>
                          <Edit className="w-3.5 h-3.5" />Update
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress steps */}
                  <div className="flex items-center gap-0 mb-4 overflow-x-auto">
                    {steps.map((step, i) => {
                      const done = i <= stepIdx
                      const current = i === stepIdx
                      return (
                        <div key={step} className="flex items-center">
                          <div className="flex flex-col items-center min-w-[80px]">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                              ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}
                              ${current ? 'ring-4 ring-green-100' : ''}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            <p className={`text-[10px] mt-1 text-center leading-tight ${done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{step}</p>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`h-0.5 w-8 mb-4 ${i < stepIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Truck className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-500">BL Number</span>
                      </div>
                      <p className={`text-sm font-bold ${po.blNumber ? 'text-gray-900' : 'text-gray-300'}`}>
                        {po.blNumber || 'Not received'}
                      </p>
                      {po.blDate && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(po.blDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-500">Payment</span>
                      </div>
                      <p className={`text-sm font-bold ${po.paymentDate ? 'text-green-700' : po.paymentStatus ? 'text-amber-700' : 'text-gray-300'}`}>
                        {po.paymentDate ? 'Received' : po.paymentStatus || 'Pending'}
                      </p>
                      {po.paymentDate && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(po.paymentDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-gray-500">BRC Status</span>
                      </div>
                      <p className={`text-sm font-bold ${po.brcStatus === 'BRC Filed' ? 'text-green-700' : 'text-gray-300'}`}>
                        {po.brcStatus || 'Not filed'}
                      </p>
                    </div>
                  </div>

                  {/* Edit form */}
                  {isEditing && (
                    <form onSubmit={handleSave} className="border-t border-indigo-100 pt-4 mt-2">
                      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">Update Dispatch Details</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">BL Number</label>
                          <Input placeholder="e.g. BLMUM240012345" value={blForm.blNumber} onChange={e => setBlForm({ ...blForm, blNumber: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">BL Date</label>
                          <Input type="date" value={blForm.blDate} onChange={e => setBlForm({ ...blForm, blDate: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                          <select
                            className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={blForm.paymentStatus} onChange={e => setBlForm({ ...blForm, paymentStatus: e.target.value })}
                          >
                            <option value="">Select...</option>
                            <option>Invoice sent — awaiting remittance</option>
                            <option>Partially received</option>
                            <option>Received</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date</label>
                          <Input type="date" value={blForm.paymentDate} onChange={e => setBlForm({ ...blForm, paymentDate: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">BRC Status</label>
                          <select
                            className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={blForm.brcStatus} onChange={e => setBlForm({ ...blForm, brcStatus: e.target.value })}
                          >
                            <option value="">Not filed</option>
                            <option>BRC Filed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingPO(null)}>Cancel</Button>
                        <Button type="submit" size="sm">Save Changes</Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No dispatched orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
