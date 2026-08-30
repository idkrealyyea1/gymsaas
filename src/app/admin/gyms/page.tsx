import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/tenant'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdminGymsClient } from './admin-gyms-client'

export const dynamic = 'force-dynamic'

export default async function AdminGymsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== UserRole.SUPER_ADMIN) {
    redirect('/app/dashboard')
  }

  await requireSuperAdmin()
  const params = await searchParams
  
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const status = params.status || ''
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (status) {
    switch (status) {
      case 'active': where.isActive = true; where.isSuspended = false; break
      case 'suspended': where.isSuspended = true; break
      case 'trial': where.trialEndsAt = { gte: new Date() }; break
      case 'expired': where.isActive = false; break
    }
  }

  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({
      where,
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { members: true, users: true } },
        branding: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.gym.count({ where }),
  ])

  return (
    <AdminGymsClient
      gyms={gyms}
      pagination={{ page, limit, total, totalPages: Math.ceil(total / limit) }}
      filters={{ search, status }}
    />
  )
}