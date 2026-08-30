import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import prisma from './prisma'
import { UserRole } from '@prisma/client'

export interface TenantContext {
  gymId: string | null
  userId: string
  role: UserRole
  isSuperAdmin: boolean
  branchId: string | null
}

export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) return null

  return {
    gymId: session.user.gymId,
    userId: session.user.id,
    role: session.user.role,
    isSuperAdmin: session.user.role === UserRole.SUPER_ADMIN,
    branchId: session.user.branchId,
  }
}

export async function requireTenantContext(): Promise<TenantContext> {
  const context = await getTenantContext()
  
  if (!context) {
    throw new Error('Unauthorized')
  }

  if (!context.isSuperAdmin && !context.gymId) {
    throw new Error('No gym associated with user')
  }

  return context
}

export async function requireSuperAdmin(): Promise<TenantContext> {
  const context = await requireTenantContext()
  
  if (!context.isSuperAdmin) {
    throw new Error('Super admin access required')
  }

  return context
}

export async function requireGymAccess(gymId: string): Promise<TenantContext> {
  const context = await requireTenantContext()
  
  if (context.isSuperAdmin) return context
  
  if (context.gymId !== gymId) {
    throw new Error('Access denied: Gym mismatch')
  }

  return context
}

export async function requirePermission(permission: string): Promise<TenantContext> {
  const context = await requireTenantContext()
  
  if (context.isSuperAdmin) return context

  const { hasPermission } = await import('./permissions')
  
  if (!hasPermission(context.role, permission as any)) {
    throw new Error(`Permission denied: ${permission}`)
  }

  return context
}

export function createTenantWhere(gymId: string | null) {
  if (!gymId) return {}
  return { gymId }
}

export function createTenantInclude<T extends Record<string, any>>(include: T): T {
  return include
}

export async function verifyGymAccess(gymId: string, userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { gymId: true, role: true },
  })

  if (!user) return false
  if (user.role === UserRole.SUPER_ADMIN) return true
  return user.gymId === gymId
}

export async function getGymBranding(gymId: string) {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    include: { branding: true, settings: true },
  })

  if (!gym) return null

  return {
    ...gym,
    branding: gym.branding || {
      primaryColor: '#111827',
      secondaryColor: '#374151',
      accentColor: '#22C55E',
      backgroundColor: '#0F0F0F',
      surfaceColor: '#1A1A1A',
      textColor: '#FFFFFF',
      sidebarColor: '#111827',
      buttonColor: '#22C55E',
      fontFamily: 'Inter',
    },
    settings: gym.settings || {
      membershipNumberFormat: 'GYM-{number:06d}',
      autoGenerateMemberId: true,
      requirePaymentForMembership: true,
      allowMemberPortal: true,
      allowPublicPage: false,
      qrCodeEnabled: true,
      checkInRequiresActiveMembership: true,
      attendanceTimeoutMinutes: 60,
      freezeDaysAllowed: 14,
      gracePeriodDays: 3,
      invoicePrefix: 'INV',
      invoiceNumberFormat: '{prefix}-{year}-{number:06d}',
      taxRate: 0,
      taxIncludedInPrice: false,
      defaultPaymentMethod: 'CASH',
      emailNotifications: false,
      smsNotifications: false,
      pushNotifications: true,
    },
  }
}

export async function getPlatformBranding() {
  const settings = await prisma.platformSettings.findFirst()
  
  return {
    platformName: settings?.platformName || 'FITCORE',
    platformLogoUrl: settings?.platformLogoUrl,
    platformFaviconUrl: settings?.platformFaviconUrl,
    primaryColor: settings?.primaryColor || '#111827',
    accentColor: settings?.accentColor || '#22C55E',
    supportEmail: settings?.supportEmail || 'support@fitcore.com',
    supportPhone: settings?.supportPhone,
  }
}