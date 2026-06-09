import { redirect } from 'next/navigation'

export default function Home() {
  // The proxy sends unauthenticated users to /login; authenticated users land here.
  redirect('/dashboard')
}
