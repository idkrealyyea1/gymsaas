import type { ReactNode } from 'react'
import { GymThemeProvider } from '@/components/gym-theme-provider'
import { AdminShell } from '@/components/admin-shell'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <GymThemeProvider>
      <AdminShell>{children}</AdminShell>
    </GymThemeProvider>
  )
}