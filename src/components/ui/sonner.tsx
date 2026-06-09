'use client'

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

/**
 * Local client-component wrapper around sonner's Toaster.
 * Importing sonner's Toaster directly into the root (server) layout breaks
 * Turbopack's RSC client manifest, so we wrap it behind a 'use client' boundary.
 */
export function Toaster(props: ToasterProps) {
  return <SonnerToaster richColors position="top-right" {...props} />
}
