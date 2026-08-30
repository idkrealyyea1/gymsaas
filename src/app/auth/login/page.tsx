import type { Metadata } from 'next'
import { getPlatformBranding } from '@/lib/tenant'
import LoginClient from './login-client'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sign in - FITCORE',
    description: 'Sign in to your FITCORE gym management account',
  }
}

export default async function LoginPage() {
  const platformBranding = await getPlatformBranding()
  return <LoginClient platformBranding={platformBranding} />
}