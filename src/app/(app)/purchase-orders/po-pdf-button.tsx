'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PoPdfProps } from './po-pdf-document'

type Props = Omit<PoPdfProps, 'logoUrl'>

export function DownloadPdfButton(props: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      // Loaded on demand so @react-pdf/renderer stays out of the main bundle.
      const [{ pdf }, { PoPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./po-pdf-document'),
      ])
      const logoUrl = `${window.location.origin}/logo-mark.png`
      const blob = await pdf(<PoPdfDocument {...props} logoUrl={logoUrl} />).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${props.po.po_no || 'purchase-order'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not generate the PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
      {loading ? 'Preparing…' : 'Download PDF'}
    </Button>
  )
}
