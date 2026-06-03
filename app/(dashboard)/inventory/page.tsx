'use client'

import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Boxes, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { toast } from 'sonner'

const rawMaterials = [
  { name: 'Teak Wood', category: 'Wood', unit: 'CFT', opening: 5000, received: 3000, issued: 6200, balance: 1800, reorder: 2000 },
  { name: 'Mango Wood', category: 'Wood', unit: 'CFT', opening: 2000, received: 1500, issued: 2800, balance: 700, reorder: 1000 },
  { name: 'Iron Hardware (Hinges)', category: 'Hardware', unit: 'pcs', opening: 10000, received: 5000, issued: 8500, balance: 6500, reorder: 3000 },
  { name: 'Nails & Screws', category: 'Hardware', unit: 'kg', opening: 200, received: 100, issued: 250, balance: 50, reorder: 100 },
  { name: 'Iron Rods', category: 'Iron', unit: 'kg', opening: 800, received: 500, issued: 900, balance: 400, reorder: 300 },
  { name: 'Corrugated Boxes', category: 'Packaging', unit: 'pcs', opening: 3000, received: 2000, issued: 4200, balance: 800, reorder: 1500 },
  { name: 'Bubble Wrap (rolls)', category: 'Packaging', unit: 'rolls', opening: 500, received: 300, issued: 600, balance: 200, reorder: 250 },
]

const finishedGoods = [
  { sku: 'SKU-WC-001', name: 'Wooden Chair Carved', unit: 'pcs', inStock: 125, committed: 100, available: 25 },
  { sku: 'SKU-PF-002', name: 'Photo Frame Set', unit: 'pcs', inStock: 1020, committed: 1000, available: 20 },
  { sku: 'SKU-AW-001', name: 'Antique Writing Desk', unit: 'pcs', inStock: 100, committed: 100, available: 0 },
]

export default function InventoryPage() {
  const lowStock = rawMaterials.filter(m => m.balance < m.reorder)

  return (
    <div>
      <Header title="Inventory" subtitle="Raw materials & finished goods" />
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Raw Material Items', value: rawMaterials.length, icon: Boxes, color: 'text-indigo-600 bg-indigo-100' },
            { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
            { label: 'SKUs in Stock', value: finishedGoods.length, icon: ArrowUpRight, color: 'text-green-600 bg-green-100' },
            { label: 'Pending Issues', value: 3, icon: ArrowDownRight, color: 'text-amber-600 bg-amber-100' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Raw materials */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Raw Material Stock</CardTitle>
              <Button size="sm" variant="outline" onClick={() => toast.info('Material receipt feature in full version')}>
                + Receive Material
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    {['Material', 'Category', 'Opening', 'Received', 'Issued', 'Balance', 'Reorder Lvl', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rawMaterials.map(m => {
                    const low = m.balance < m.reorder
                    return (
                      <tr key={m.name} className={low ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.category}</span></td>
                        <td className="px-4 py-3 text-gray-600">{m.opening.toLocaleString()} {m.unit}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">+{m.received.toLocaleString()}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">-{m.issued.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{m.balance.toLocaleString()} {m.unit}</td>
                        <td className="px-4 py-3 text-gray-400">{m.reorder.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${low ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {low ? 'Low Stock' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Finished goods */}
        <Card>
          <CardHeader><CardTitle>Finished Goods Stock</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    {['SKU Code', 'SKU Name', 'In Stock', 'Committed', 'Available'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {finishedGoods.map(fg => (
                    <tr key={fg.sku} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{fg.sku}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{fg.name}</td>
                      <td className="px-4 py-3 text-gray-600">{fg.inStock} {fg.unit}</td>
                      <td className="px-4 py-3 text-amber-600">{fg.committed} {fg.unit}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        <span className={fg.available === 0 ? 'text-red-600' : 'text-green-600'}>
                          {fg.available} {fg.unit}
                        </span>
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
