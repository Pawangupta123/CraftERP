'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { getUser, type AuthUser } from '@/lib/auth'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => { setUser(getUser()) }, [])

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
            {user?.name?.charAt(0) ?? ''}
          </div>
          <span className="text-sm text-gray-700 font-medium">{user?.name ?? ''}</span>
        </div>
      </div>
    </header>
  )
}
