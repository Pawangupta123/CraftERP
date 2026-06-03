'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { buyerPOs, getBuyer, PRODUCTION_STAGES } from '@/lib/mockData'
import { getUser, type AuthUser } from '@/lib/auth'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, Edit } from 'lucide-react'
import { toast } from 'sonner'

const STAGE_COLORS = [
  'bg-gray-400', 'bg-blue-400', 'bg-amber-400',
  'bg-orange-400', 'bg-purple-400', 'bg-green-500'
]

export default function ProductionPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => { setUser(getUser()) }, [])
  const isSupervisor = user?.role === 'supervisor'

  const activePOs = buyerPOs.filter(po =>
    ['Open', 'In Progress'].includes(po.status) &&
    (!isSupervisor || po.supervisor === user?.name)
  )

  const allSKUs = activePOs.flatMap(po =>
    po.skus.map(sku => ({ ...sku, po, buyer: getBuyer(po.buyerId) }))
  )

  const [filterStage, setFilterStage] = useState<string>('All')

  const filtered = filterStage === 'All' ? allSKUs : allSKUs.filter(s => s.stage === filterStage)

  const stageCounts = PRODUCTION_STAGES.reduce((acc, s) => {
    acc[s] = allSKUs.filter(sk => sk.stage === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <Header title="Production Tracking" subtitle={`${allSKUs.length} active SKUs across ${activePOs.length} POs`} />
      <div className="p-6 space-y-5">
        {/* Stage summary */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {PRODUCTION_STAGES.map((stage, i) => (
            <button
              key={stage}
              onClick={() => setFilterStage(filterStage === stage ? 'All' : stage)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${filterStage === stage ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[i]} mb-2`} />
              <p className="text-xs font-semibold text-gray-700 leading-tight">{stage}</p>
              <p className={`text-xl font-bold mt-1 ${stageCounts[stage] > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                {stageCounts[stage]}
              </p>
            </button>
          ))}
        </div>

        {/* SKU list */}
        <div className="space-y-3">
          {filtered.map(item => {
            const stageIdx = PRODUCTION_STAGES.indexOf(item.stage)
            return (
              <Card key={`${item.po.id}-${item.code}`} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.code}</span>
                        <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium text-white ${STAGE_COLORS[stageIdx]}`}>
                          {item.stage}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mb-2">
                        <span>{item.po.poNumber}</span>
                        {!isSupervisor && <span>{item.buyer?.company}</span>}
                        <span>{item.orderedQty.toLocaleString()} pcs</span>
                        <span>Supervisor: {item.po.supervisor}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={item.progress} className="flex-1 h-2" />
                        <span className="text-sm font-bold text-indigo-600 w-10 text-right">{item.progress}%</span>
                      </div>
                      {item.remarks && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{item.remarks}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isSupervisor && (
                        <Button size="sm" variant="outline" onClick={() => toast.success('Progress updated! (Demo)')}>
                          <Edit className="w-3.5 h-3.5" />Update
                        </Button>
                      )}
                      <Link href={`/pos/${item.po.id}`}>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No SKUs in this stage</div>
          )}
        </div>
      </div>
    </div>
  )
}
