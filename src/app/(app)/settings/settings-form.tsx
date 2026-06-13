'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveCompanySettings } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type CompanyInitial = {
  name: string
  address: string
  city: string
  gstin: string
  website: string
  email: string
  phone: string
}

const trimOrNull = (v: string): string | null => v.trim() || null

export function SettingsForm({ initial }: { initial: CompanyInitial }) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [address, setAddress] = useState(initial.address)
  const [city, setCity] = useState(initial.city)
  const [gstin, setGstin] = useState(initial.gstin)
  const [website, setWebsite] = useState(initial.website)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await saveCompanySettings({
      name: trimOrNull(name),
      address: trimOrNull(address),
      city: trimOrNull(city),
      gstin: trimOrNull(gstin),
      website: trimOrNull(website),
      email: trimOrNull(email),
      phone: trimOrNull(phone),
    })
    if (res.error) {
      toast.error(res.error)
      setSubmitting(false)
      return
    }
    toast.success('Company details saved')
    setSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
          <CardDescription>Shown on your purchase order invoices — header address and footer contact.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="JimiFern" className="h-9" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City / State</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jodhpur, Rajasthan" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gstin">GSTIN / Tax ID</Label>
            <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="e.g. 08ABCDE1234F1Z5" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.jimifern.com" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@jimifern.com" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className="h-9" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
