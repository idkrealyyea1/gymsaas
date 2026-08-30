import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MembersClient } from './members-client'

export const dynamic = 'force-dynamic'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role === UserRole.SUPER_ADMIN) {
    redirect('/admin')
  }

  if (!session.user.gymId) {
    redirect('/auth/login?error=no-gym')
  }

  const context = await requireTenantContext()
  const gymId = context.gymId!
  const params = await searchParams
  
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const status = params.status || ''
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = { gymId, isActive: true }
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { memberId: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (status) {
    where.status = status
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1,
        },
        _count: { select: { attendance: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.member.count({ where }),
  ])

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    include: { branding: true, subscription: { include: { plan: true } } },
  })

  const statuses = ['ACTIVE', 'EXPIRED', 'FROZEN', 'CANCELLED', 'PENDING']

  return (
    <MembersClient
      gym={gym}
      members={members}
      pagination={{ page, limit, total, totalPages: Math.ceil(total / limit) }}
      filters={{ search, status }}
      statuses={statuses}
    />
  )
}