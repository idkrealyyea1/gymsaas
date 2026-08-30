import type { ReactNode } from 'react'
import { GymThemeProvider } from '@/components/gym-theme-provider'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <GymThemeProvider>{children}</GymThemeProvider>
}