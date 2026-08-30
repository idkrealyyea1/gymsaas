import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const context = await requireTenantContext()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    if (!q.trim()) {
      return NextResponse.json({ members: [] })
    }

    const members = await prisma.member.findMany({
      where: {
        gymId: context.gymId,
        isActive: true,
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { memberId: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1,
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ members })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}