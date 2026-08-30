'use client'

import * as React from 'react'
import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2, Eye, EyeOff, Building2, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { GymThemeProvider } from '@/components/gym-theme-provider'

export interface PlatformBranding {
  platformName: string
  platformLogoUrl: string | null
  platformFaviconUrl: string | null
  primaryColor: string
  accentColor: string
  supportEmail: string
  supportPhone: string | null
}

interface LoginPageProps {
  platformBranding: PlatformBranding
}

export default function LoginPage({ platformBranding }: LoginPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/app/dashboard'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gymSlug, setGymSlug] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        gymSlug: isSuperAdmin ? '' : gymSlug,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Welcome back!')
        const session = await getSession()
        const dest =
          session?.user?.role === 'SUPER_ADMIN' ? '/admin' : callbackUrl
        router.push(dest)
        router.refresh()
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const primaryColor = platformBranding?.primaryColor || '#111827'
  const accentColor = platformBranding?.accentColor || '#22C55E'

  return (
    <GymThemeProvider>
      <div className="min-h-screen flex" style={{ backgroundColor: primaryColor }}>
        <div className="flex-1 flex items-center justify-center p-8 hidden lg:block">
          <div className="max-w-md text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Dumbbell className="h-10 w-10" style={{ color: accentColor }} />
              <span className="text-3xl font-bold" style={{ color: accentColor }}>
                {platformBranding?.platformName || 'FITCORE'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Manage Your Gym Smarter</h1>
            <p className="text-lg opacity-80 mb-8">
              Professional gym management platform for fitness centers, personal trainers, and sports clubs.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold" style={{ color: accentColor }}>500+</div>
                <div className="opacity-70">Gyms</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold" style={{ color: accentColor }}>50K+</div>
                <div className="opacity-70">Members</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold" style={{ color: accentColor }}>99.9%</div>
                <div className="opacity-70">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md lg:w-96 bg-background p-8 lg:p-12 shadow-xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
              <Dumbbell className="h-8 w-8" style={{ color: accentColor }} />
              <span className="text-xl font-bold" style={{ color: accentColor }}>
                {platformBranding?.platformName || 'FITCORE'}
              </span>
            </Link>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                {error === 'unauthorized'
                  ? 'Unauthorized access. Please sign in.'
                  : error === 'no-gym'
                  ? 'No gym associated with your account.'
                  : 'Invalid credentials. Please try again.'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={!isSuperAdmin ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setIsSuperAdmin(false)}
                  style={!isSuperAdmin ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Gym Staff
                </Button>
                <Button
                  type="button"
                  variant={isSuperAdmin ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setIsSuperAdmin(true)}
                  style={isSuperAdmin ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                >
                  <span className="text-xs">Super Admin</span>
                </Button>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="gymSlug">Gym Slug</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {platformBranding?.platformName?.toLowerCase() || 'fitcore'}.com/
                  </span>
                  <Input
                    id="gymSlug"
                    value={gymSlug}
                    onChange={(e) => setGymSlug(e.target.value.toLowerCase())}
                    placeholder="your-gym"
                    disabled={isLoading}
                    className="pl-24"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Find your gym&apos;s unique URL slug
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            Accounts are provisioned by your FITCORE administrator.
          </p>

          <Separator className="my-6" />

          <div className="rounded-lg border p-4 text-xs" style={{ borderColor: '#374151' }}>
            <p className="font-semibold mb-2">Demo credentials</p>
            <div className="space-y-1 text-muted-foreground">
              <p>Gym Staff: slug <code className="text-primary">iron-house-fitness</code> · <code className="text-primary">owner@ironhousefitness.com</code> / <code className="text-primary">owner123</code></p>
              <p>Super Admin: <code className="text-primary">admin@fitcore.com</code> / <code className="text-primary">superadmin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </GymThemeProvider>
  )
}