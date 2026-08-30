'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Hammer } from 'lucide-react'
import { useGymTheme } from '@/components/gym-theme-provider'

export function UnderConstruction() {
  const { theme } = useGymTheme()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Hammer className="h-16 w-16 mb-6" style={{ color: theme.accent }} />
      <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
        Under construction
      </h1>
      <p className="text-muted-foreground mb-8">
        This module is being built and will be available soon.
      </p>
      <Button asChild style={{ backgroundColor: theme.primary }}>
        <Link href="/app/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}