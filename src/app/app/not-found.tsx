'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useGymTheme } from '@/components/gym-theme-provider'

export default function AppNotFound() {
  const { theme } = useGymTheme()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-bold mb-4" style={{ color: theme.accent }}>
        404
      </p>
      <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
        Page not found
      </h1>
      <p className="text-muted-foreground mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild style={{ backgroundColor: theme.primary }}>
        <Link href="/app/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}