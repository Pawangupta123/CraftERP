'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { buyerPOs, buyers, getBuyer, getStatusColor } from '@/lib/mockData'
import { getUser, type AuthUser } from '@/lib/auth'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FileText, Users, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Package, Factory, ChevronRight
} from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => { setUser(getUser()) }, [])

  const isAdmin = user?.role === 'admin'
  const isSupervisor = user?.role === 'supervisor'

  const myPOs = isSupervisor
    ? buyerPOs.filter(po => po.supervisor === user?.name)
    : buyerPOs

  const stats = useMemo(() => ({
    total: myPOs.length,
    open: myPOs.filter(p => p.status === 'Open').length,
    inProgress: myPOs.filter(p => p.status === 'In Progress').length,
    dispatched: myPOs.filter(p => ['Dispatched', 'Awaiting BL', 'Awaiting Payment', 'Awaiting BRC'].includes(p.status)).length,
    closed: myPOs.filter(p => p.status === 'Closed').length,
    totalSKUs: myPOs.reduce((s, p) => s + p.skus.length, 0),
  }), [myPOs])

  const recentPOs = myPOs.slice(0, 5)

  const urgentPOs = myPOs.filter(p => {
    const days = Math.ceil((new Date(p.deliveryDate).getTime() - Date.now()) / 86400000)
    return days <= 30 && p.status !== 'Closed' && p.status !== 'Dispatched'
  })

  return (
    <div>
      <Header
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total POs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.totalSKUs} SKUs tracked</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{stats.inProgress + stats.open}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.open} open, {stats.inProgress} active</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Factory className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Dispatched</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.dispatched}</p>
                  <p className="text-xs text-gray-400 mt-1">Awaiting clearance</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Closed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.closed}</p>
                  <p className="text-xs text-gray-400 mt-1">Fully completed</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent POs */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Purchase Orders</CardTitle>
                <Link href="/pos">
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentPOs.map(po => {
                  const buyer = getBuyer(po.buyerId)
                  const avgProgress = po.skus.length > 0
                    ? Math.round(po.skus.reduce((s, sk) => s + sk.progress, 0) / po.skus.length)
                    : 0
                  return (
                    <Link key={po.id} href={`/pos/${po.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{po.poNumber}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(po.status)}`}>
                            {po.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {!isSupervisor && <span>{buyer?.company}</span>}
                          <span>{po.skus.length} SKUs</span>
                          <span>Due {new Date(po.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        {po.status === 'In Progress' && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <Progress value={avgProgress} className="h-1.5 flex-1" />
                            <span className="text-[10px] text-gray-400 w-8 text-right">{avgProgress}%</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-4">
            {/* Urgent POs */}
            {urgentPOs.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {urgentPOs.slice(0, 3).map(po => {
                    const days = Math.ceil((new Date(po.deliveryDate).getTime() - Date.now()) / 86400000)
                    return (
                      <Link key={po.id} href={`/pos/${po.id}`} className="flex justify-between items-center text-sm hover:bg-red-50 -mx-2 px-2 py-1.5 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{po.poNumber}</p>
                          <p className="text-xs text-gray-500">{po.skus.length} SKUs</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${days <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {days}d left
                        </span>
                      </Link>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Status breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Open', count: stats.open, color: 'bg-blue-500' },
                  { label: 'In Progress', count: stats.inProgress, color: 'bg-amber-500' },
                  { label: 'Dispatched/Pending', count: stats.dispatched, color: 'bg-purple-500' },
                  { label: 'Closed', count: stats.closed, color: 'bg-green-500' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                    <span className="text-xs text-gray-600 flex-1">{label}</span>
                    <span className="text-sm font-semibold text-gray-800">{count}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {isAdmin && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Buyers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {buyers.slice(0, 4).map(b => (
                    <div key={b.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {b.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{b.company}</p>
                        <p className="text-[10px] text-gray-400">{b.country}</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/buyers">
                    <Button variant="ghost" size="sm" className="w-full mt-1 text-indigo-600 text-xs">
                      View all buyers <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
