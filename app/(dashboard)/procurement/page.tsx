'use client'

import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Package, CheckCircle2, Clock } from 'lucide-react'
import { buyerPOs } from '@/lib/mockData'
import { toast } from 'sonner'

export default function ProcurementPage() {
  const allProc = buyerPOs.flatMap(po =>
    po.procurement.map(p => ({ ...p, poNumber: po.poNumber, poId: po.id }))
  )

  const received = allProc.filter(p => p.status === 'Received').length
  const ordered = allProc.filter(p => p.status === 'Ordered').length
  const pending = allProc.filter(p => p.status === 'Pending').length

  return (
    <div>
      <Header title="Procurement" subtitle="Supplier purchase orders" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Received', count: received, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
            { label: 'Ordered', count: ordered, icon: Clock, color: 'text-blue-600 bg-blue-100' },
            { label: 'Pending', count: pending, icon: Package, color: 'text-amber-600 bg-amber-100' },
          ].map(({ label, count, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={() => toast.info('Create procurement PO feature in full version')}>
            <Plus className="w-4 h-4" />Create Procurement PO
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Proc. PO No.', 'Buyer PO', 'Supplier', 'Category', 'Quantity', 'Expected Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allProc.map(proc => (
                <tr key={proc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{proc.poNumber}</td>
                  <td className="px-4 py-3 text-indigo-600 text-xs font-medium">{proc.poNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{proc.supplier}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{proc.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{proc.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(proc.expectedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      proc.status === 'Received' ? 'bg-green-100 text-green-700'
                      : proc.status === 'Ordered' ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>{proc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
