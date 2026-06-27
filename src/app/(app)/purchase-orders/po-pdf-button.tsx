'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PoPdfProps } from './po-pdf-document'

type Props = Omit<PoPdfProps, 'logoUrl'>

export function PrintPdfButton(props: Props) {
  const [loading, setLoading] = useState(false)

  async function handlePrint() {
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

      // Print the PDF silently via a hidden iframe — opens the browser print
      // dialog straight on the paginated document, no download step.
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.src = url

      const cleanup = () => {
        URL.revokeObjectURL(url)
        iframe.remove()
      }

      iframe.onload = () => {
        const win = iframe.contentWindow
        if (!win) {
          // Fallback: open the PDF in a new tab so the user can print from there.
          window.open(url, '_blank')
          return
        }
        win.addEventListener('afterprint', cleanup)
        win.focus()
        win.print()
        // Safety cleanup if afterprint never fires (some browsers).
        setTimeout(cleanup, 60_000)
      }

      document.body.appendChild(iframe)
    } catch {
      toast.error('Could not open the print view. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handlePrint} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
      {loading ? 'Preparing…' : 'Print'}
    </Button>
  )
}
