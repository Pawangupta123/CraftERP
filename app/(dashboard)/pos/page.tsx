'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { buyerPOs, getBuyer, getStatusColor, type POStatus } from '@/lib/mockData'
import { getUser, type AuthUser } from '@/lib/auth'
import Header from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Plus, Search, ChevronRight, Calendar, Users } from 'lucide-react'

const ALL_STATUSES: POStatus[] = ['Open', 'In Progress', 'Dispatched', 'Awaiting BL', 'Awaiting Payment', 'Awaiting BRC', 'Closed']

export default function POListPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => { setUser(getUser()) }, [])

  const isSupervisor = user?.role === 'supervisor'
  const isAdmin = user?.role === 'admin'

  const basePOs = isSupervisor ? buyerPOs.filter(p => p.supervisor === user?.name) : buyerPOs

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<POStatus | 'All'>('All')

  const filtered = basePOs.filter(po => {
    const buyer = getBuyer(po.buyerId)
    const matchSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      buyer?.company.toLowerCase().includes(search.toLowerCase()) || ''
    const matchStatus = activeStatus === 'All' || po.status === activeStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <Header
        title={isSupervisor ? 'Assigned Purchase Orders' : 'Buyer Purchase Orders'}
        subtitle={`${filtered.length} of ${basePOs.length} orders`}
      />
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search PO number, buyer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...ALL_STATUSES] as const).map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeStatus === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Link href="/pos/new" className="ml-auto">
              <Button size="sm">
                <Plus className="w-4 h-4" />New PO
              </Button>
            </Link>
          )}
        </div>

        {/* PO Cards */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(po => {
            const buyer = getBuyer(po.buyerId)
            const avgProgress = po.skus.length > 0
              ? Math.round(po.skus.reduce((s, sk) => s + sk.progress, 0) / po.skus.length)
              : 0
            const daysLeft = Math.ceil((new Date(po.deliveryDate).getTime() - Date.now()) / 86400000)

            return (
              <Link key={po.id} href={`/pos/${po.id}`}>
                <Card className="hover:shadow-md transition-all hover:border-indigo-200 cursor-pointer">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-base font-bold text-gray-900">{po.poNumber}</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(po.status)}`}>
                            {po.status}
                          </span>
                          {daysLeft <= 30 && po.status !== 'Closed' && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${daysLeft <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          {!isSupervisor && (
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{buyer?.company} · {buyer?.country}</span>
                          )}
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                            {new Date(po.poDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                            {' → '}
                            {new Date(po.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </span>
                          <span>{po.skus.length} SKUs</span>
                          <span>Supervisor: {po.supervisor}</span>
                        </div>

                        {/* SKU mini list */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {po.skus.slice(0, 3).map(sku => (
                            <span key={sku.code} className="text-[11px] bg-gray-100 text-gray-600 rounded-md px-2 py-0.5">
                              {sku.code} · {sku.orderedQty.toLocaleString()} pcs
                            </span>
                          ))}
                          {po.skus.length > 3 && (
                            <span className="text-[11px] bg-gray-100 text-gray-600 rounded-md px-2 py-0.5">
                              +{po.skus.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        {po.status === 'In Progress' && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">Avg Progress</p>
                            <p className="text-lg font-bold text-indigo-600">{avgProgress}%</p>
                            <Progress value={avgProgress} className="w-24 h-1.5 mt-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No purchase orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
