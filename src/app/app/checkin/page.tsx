import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CheckInClient from './check-in-client'

export const dynamic = 'force-dynamic'

export default async function CheckInPage() {
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

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999))

  const [gym, recentAttendance, activeMembersToday, currentlyInside] = await Promise.all([
    prisma.gym.findUnique({
      where: { id: gymId },
      include: { branding: true },
    }),
    prisma.attendance.findMany({
      where: {
        gymId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        member: { select: { profilePhotoUrl: true, firstName: true, lastName: true, memberId: true } },
      },
      orderBy: { checkInAt: 'desc' },
      take: 50,
    }),
    prisma.attendance.groupBy({
      by: ['memberId'],
      where: {
        gymId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.attendance.count({
      where: {
        gymId,
        status: 'CHECKED_IN',
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
    }),
  ])

  return (
    <CheckInClient
      gym={gym}
      recentAttendance={recentAttendance}
      activeMembersToday={activeMembersToday.length}
      currentlyInside={currentlyInside}
    />
  )
}