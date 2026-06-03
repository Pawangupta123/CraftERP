'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { buyerPOs, getBuyer, getStatusColor, PRODUCTION_STAGES } from '@/lib/mockData'
import { getUser, type AuthUser } from '@/lib/auth'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, CheckCircle2, Circle, Clock, Package, ShoppingCart,
  Truck, FileText, CreditCard, ChevronRight, MapPin, Phone, Mail, Globe, Edit
} from 'lucide-react'
import { toast } from 'sonner'

const TABS = ['Overview', 'SKUs & Production', 'Procurement', 'Documents'] as const
type Tab = typeof TABS[number]

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => { setUser(getUser()) }, [])
  const isSupervisor = user?.role === 'supervisor'

  const po = buyerPOs.find(p => p.id === id)
  if (!po) return <div className="p-8 text-gray-500">PO not found.</div>

  const buyer = getBuyer(po.buyerId)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const avgProgress = po.skus.length > 0
    ? Math.round(po.skus.reduce((s, sk) => s + sk.progress, 0) / po.skus.length)
    : 0

  const lifecycle = [
    { key: 'po', label: 'PO Created', done: true, date: po.poDate },
    { key: 'procurement', label: 'Procurement', done: po.procurement.some(p => p.status === 'Received'), date: '' },
    { key: 'production', label: 'In Production', done: avgProgress > 0, date: '' },
    { key: 'dispatch', label: 'Dispatched', done: ['Dispatched', 'Awaiting BL', 'Awaiting Payment', 'Awaiting BRC', 'Closed'].includes(po.status), date: '' },
    { key: 'bl', label: 'BL Received', done: !!po.blNumber, date: po.blDate || '' },
    { key: 'payment', label: 'Payment', done: po.paymentDate !== undefined, date: po.paymentDate || '' },
    { key: 'brc', label: 'BRC Filed', done: po.brcStatus === 'BRC Filed', date: '' },
  ]

  return (
    <div>
      <Header title={po.poNumber} subtitle={`${po.skus.length} SKUs · ${po.supervisor}`} />
      <div className="p-6 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/pos">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" />Back to POs</Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(po.status)}`}>
              {po.status}
            </span>
            {!isSupervisor && (
              <Button size="sm" variant="outline" onClick={() => toast.info('Edit feature coming in full version')}>
                <Edit className="w-4 h-4" />Edit PO
              </Button>
            )}
          </div>
        </div>

        {/* Lifecycle tracker */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Order Lifecycle</p>
            <div className="flex items-start gap-0 overflow-x-auto pb-2">
              {lifecycle.map((step, i) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {step.done
                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                        : <Circle className="w-4 h-4 text-gray-400" />}
                    </div>
                    <p className={`text-[10px] font-medium mt-1.5 text-center leading-tight ${step.done ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                    {step.date && <p className="text-[9px] text-gray-400 mt-0.5">{new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                  </div>
                  {i < lifecycle.length - 1 && (
                    <div className={`h-0.5 w-8 mx-0 mb-5 ${lifecycle[i + 1].done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(tab => {
            const hidden = isSupervisor && (tab === 'Procurement' || tab === 'Documents')
            if (hidden) return null
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PO Info */}
            <Card>
              <CardHeader><CardTitle>PO Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ['PO Number', po.poNumber],
                  ['PO Date', new Date(po.poDate).toLocaleDateString('en-IN', { dateStyle: 'long' })],
                  ['Delivery Date', new Date(po.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'long' })],
                  ['Supervisor', po.supervisor],
                  ['Remarks', po.remarks || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 font-medium text-right">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Buyer info — hidden from supervisor */}
            {!isSupervisor && buyer && (
              <Card>
                <CardHeader><CardTitle>Buyer Details</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {buyer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{buyer.name}</p>
                      <p className="text-gray-500 text-xs">{buyer.company}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600"><Globe className="w-3.5 h-3.5 text-gray-400" />{buyer.country}</div>
                    <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-3.5 h-3.5 text-gray-400" />{buyer.address}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{buyer.phone}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{buyer.email}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Production summary */}
            <Card className={isSupervisor ? '' : 'md:col-span-2'}>
              <CardHeader><CardTitle>Production Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-bold text-indigo-600">{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {po.skus.map(sku => (
                    <div key={sku.code} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{sku.code}</p>
                          <p className="text-[10px] text-gray-500">{sku.orderedQty.toLocaleString()} pcs</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{sku.progress}%</span>
                      </div>
                      <Progress value={sku.progress} className="h-1.5" />
                      <p className="text-[10px] text-gray-500 mt-1">{sku.stage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: SKUs & Production */}
        {activeTab === 'SKUs & Production' && (
          <div className="space-y-4">
            {po.skus.map(sku => {
              const stageIdx = PRODUCTION_STAGES.indexOf(sku.stage)
              return (
                <Card key={sku.code}>
                  <CardContent className="pt-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{sku.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{sku.code}</span>
                          <span>·</span>
                          <span>{sku.orderedQty.toLocaleString()} pieces ordered</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{sku.progress}%</p>
                        <p className="text-xs text-gray-400">complete</p>
                        {sku.remarks && !isSupervisor && (
                          <p className="text-xs text-gray-500 mt-1 italic">{sku.remarks}</p>
                        )}
                      </div>
                    </div>
                    <Progress value={sku.progress} className="h-2 mb-5" />

                    {/* Production stages */}
                    <div className="flex items-center gap-0 overflow-x-auto">
                      {PRODUCTION_STAGES.map((stage, i) => {
                        const done = i < stageIdx
                        const current = i === stageIdx
                        return (
                          <div key={stage} className="flex items-center">
                            <div className="flex flex-col items-center min-w-[90px]">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                ${done ? 'bg-green-500 text-white' : current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                                {done ? '✓' : i + 1}
                              </div>
                              <p className={`text-[10px] mt-1 text-center leading-tight max-w-[80px]
                                ${done ? 'text-green-600 font-medium' : current ? 'text-indigo-700 font-semibold' : 'text-gray-400'}`}>
                                {stage}
                              </p>
                            </div>
                            {i < PRODUCTION_STAGES.length - 1 && (
                              <div className={`h-0.5 w-6 mb-4 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {isSupervisor && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                        <Button size="sm" onClick={() => toast.success('Production update saved (demo)')}>
                          <Edit className="w-3.5 h-3.5" />Update Progress
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Tab: Procurement */}
        {activeTab === 'Procurement' && !isSupervisor && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => toast.info('Add procurement feature in full version')}>
                <ShoppingCart className="w-4 h-4" />Add Procurement PO
              </Button>
            </div>
            {po.procurement.map(proc => (
              <Card key={proc.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-gray-800">{proc.poNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          proc.status === 'Received' ? 'bg-green-100 text-green-700'
                          : proc.status === 'Ordered' ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>{proc.status}</span>
                      </div>
                      <p className="text-sm text-gray-600">{proc.supplier} · {proc.category}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {proc.quantity} · Expected: {new Date(proc.expectedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${proc.status === 'Received' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Package className={`w-5 h-5 ${proc.status === 'Received' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === 'Documents' && !isSupervisor && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Truck, label: 'BL Number', value: po.blNumber || '—', sub: po.blDate ? `Date: ${new Date(po.blDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : 'Not received', color: po.blNumber ? 'green' : 'gray' },
              { icon: CreditCard, label: 'Payment Status', value: po.paymentStatus || 'Pending', sub: po.paymentDate ? `Received: ${new Date(po.paymentDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : 'Awaiting', color: po.paymentDate ? 'green' : 'amber' },
              { icon: FileText, label: 'BRC Status', value: po.brcStatus || 'Not Filed', sub: po.brcStatus === 'BRC Filed' ? 'Completed' : 'Pending after payment', color: po.brcStatus ? 'green' : 'gray' },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-5">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${color === 'green' ? 'bg-green-100' : color === 'amber' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${color === 'green' ? 'text-green-600' : color === 'amber' ? 'text-amber-600' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                  <p className="text-sm font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                  {!isSupervisor && (
                    <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={() => toast.info('Update feature in full version')}>
                      Update
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
