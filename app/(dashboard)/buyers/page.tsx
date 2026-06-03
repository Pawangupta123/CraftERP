'use client'

import { useState } from 'react'
import { buyers, buyerPOs } from '@/lib/mockData'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Globe, Phone, Mail, MapPin, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function BuyersPage() {
  const [search, setSearch] = useState('')

  const filtered = buyers.filter(b =>
    b.company.toLowerCase().includes(search.toLowerCase()) ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <Header title="Buyers" subtitle={`${buyers.length} registered buyers`} />
      <div className="p-6 space-y-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search buyers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button size="sm" onClick={() => toast.info('Add buyer feature in full version')}>
            <Plus className="w-4 h-4" />Add Buyer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(buyer => {
            const pos = buyerPOs.filter(p => p.buyerId === buyer.id)
            const activePOs = pos.filter(p => !['Closed'].includes(p.status)).length
            return (
              <Card key={buyer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                      {buyer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{buyer.company}</h3>
                      <p className="text-sm text-gray-500">{buyer.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{buyer.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-400 shrink-0" />{buyer.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-gray-400 shrink-0" />{buyer.email}</div>
                    <div className="flex items-start gap-2"><MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />{buyer.address}</div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{pos.length} total POs</span>
                      {activePOs > 0 && <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded font-medium">{activePOs} active</span>}
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => toast.info('Buyer details in full version')}>
                      View POs →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
