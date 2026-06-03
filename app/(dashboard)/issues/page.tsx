'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Factory, Wrench, Package } from 'lucide-react'
import { toast } from 'sonner'
import { buyerPOs } from '@/lib/mockData'

type IssueType = 'Production' | 'Maintenance' | 'Other'

const mockIssues = [
  { id: 'i1', buyerPO: 'PO-2024-001', sku: 'SKU-WC-001', item: 'Teak Wood', qty: '1200 CFT', issueType: 'Production' as IssueType, date: '2024-01-25', issuedBy: 'Mohan Lal' },
  { id: 'i2', buyerPO: 'PO-2024-001', sku: 'SKU-WT-002', item: 'Mango Wood', qty: '800 CFT', issueType: 'Production' as IssueType, date: '2024-01-26', issuedBy: 'Mohan Lal' },
  { id: 'i3', buyerPO: 'PO-2024-001', sku: 'SKU-WC-001', item: 'Iron Hinges', qty: '500 pcs', issueType: 'Production' as IssueType, date: '2024-01-27', issuedBy: 'Mohan Lal' },
  { id: 'i4', buyerPO: '—', sku: '—', item: 'Diesel', qty: '50 ltr', issueType: 'Maintenance' as IssueType, date: '2024-02-01', issuedBy: 'Mohan Lal' },
  { id: 'i5', buyerPO: '—', sku: '—', item: 'Machine Grease', qty: '5 kg', issueType: 'Maintenance' as IssueType, date: '2024-02-05', issuedBy: 'Mohan Lal' },
  { id: 'i6', buyerPO: 'PO-2024-002', sku: 'SKU-MC-001', item: 'Mango Wood', qty: '600 CFT', issueType: 'Production' as IssueType, date: '2024-02-08', issuedBy: 'Mohan Lal' },
  { id: 'i7', buyerPO: '—', sku: '—', item: 'Stationery', qty: '1 lot', issueType: 'Other' as IssueType, date: '2024-02-10', issuedBy: 'Mohan Lal' },
]

const TYPE_CONFIG = {
  Production: { icon: Factory, color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  Maintenance: { icon: Wrench, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Other: { icon: Package, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
}

export default function IssuesPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<IssueType | 'All'>('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ buyerPO: '', sku: '', item: '', qty: '', issueType: 'Production' as IssueType })

  const filtered = mockIssues.filter(issue => {
    const matchSearch = issue.item.toLowerCase().includes(search.toLowerCase()) ||
      issue.buyerPO.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'All' || issue.issueType === filterType
    return matchSearch && matchType
  })

  const counts = {
    Production: mockIssues.filter(i => i.issueType === 'Production').length,
    Maintenance: mockIssues.filter(i => i.issueType === 'Maintenance').length,
    Other: mockIssues.filter(i => i.issueType === 'Other').length,
  }

  function handleIssue(e: React.FormEvent) {
    e.preventDefault()
    toast.success(`Material issued: ${form.item} — ${form.qty} (Demo)`)
    setShowForm(false)
    setForm({ buyerPO: '', sku: '', item: '', qty: '', issueType: 'Production' })
  }

  return (
    <div>
      <Header title="Material Issues" subtitle="Track materials issued from store" />
      <div className="p-6 space-y-5">
        {/* Issue type summary */}
        <div className="grid grid-cols-3 gap-4">
          {(['Production', 'Maintenance', 'Other'] as IssueType[]).map(type => {
            const { icon: Icon, color, dot } = TYPE_CONFIG[type]
            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? 'All' : type)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${filterType === type ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{type}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{counts[type]}</p>
                <p className="text-xs text-gray-400 mt-0.5">issues recorded</p>
              </button>
            )
          })}
        </div>

        {/* Issue form */}
        {showForm && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Issue Material from Store</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleIssue} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Issue Type *</label>
                  <select
                    className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value as IssueType })}
                  >
                    <option>Production</option>
                    <option>Maintenance</option>
                    <option>Other</option>
                  </select>
                </div>
                {form.issueType === 'Production' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Buyer PO *</label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={form.buyerPO} onChange={e => setForm({ ...form, buyerPO: e.target.value })} required
                      >
                        <option value="">Select PO...</option>
                        {buyerPOs.filter(p => ['Open', 'In Progress'].includes(p.status)).map(p => (
                          <option key={p.id} value={p.poNumber}>{p.poNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <Input placeholder="e.g. SKU-WC-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item Name *</label>
                  <Input placeholder="e.g. Teak Wood" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                  <Input placeholder="e.g. 500 CFT" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} required />
                </div>
                <div className="col-span-2 flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm">Issue Material</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search item, PO..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />Issue Material
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Item', 'Qty Issued', 'Issue Type', 'Buyer PO', 'SKU', 'Date', 'Issued By'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(issue => {
                    const { color, dot } = TYPE_CONFIG[issue.issueType]
                    return (
                      <tr key={issue.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{issue.item}</td>
                        <td className="px-4 py-3 text-gray-600">{issue.qty}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 w-fit text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            {issue.issueType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-indigo-600 font-mono text-xs">{issue.buyerPO}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{issue.sku}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {issue.date !== '—' ? new Date(issue.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{issue.issuedBy}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
