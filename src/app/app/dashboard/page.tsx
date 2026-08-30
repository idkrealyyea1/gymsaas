import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getRevenueSeries, getMemberGrowthSeries, getAttendanceByDowSeries } from '@/lib/chart-data'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, getGreeting } from '@/lib/utils'
import { DashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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

  // Get dashboard stats
  const [
    activeMembers,
    newMembersThisMonth,
    todayAttendance,
    expiringSoon,
    todayRevenue,
    monthlyRevenue,
    outstandingPayments,
    activeClasses,
    recentPayments,
    recentMembers,
    upcomingExpirations,
    upcomingClasses,
    revenueChartData,
    membershipGrowthData,
    attendanceChartData,
  ] = await Promise.all([
    prisma.member.count({
      where: { gymId, status: 'ACTIVE', isActive: true },
    }),
    prisma.member.count({
      where: {
        gymId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.attendance.count({
      where: {
        gymId,
        checkInAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.membership.count({
      where: {
        gymId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        gymId,
        status: 'PAID',
        paidAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({
      where: {
        gymId,
        status: 'PAID',
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({
      where: {
        gymId,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      _sum: { total: true },
    }),
    prisma.class.count({
      where: { gymId, isActive: true },
    }),
    prisma.payment.findMany({
      where: { gymId, status: 'PAID' },
      include: { member: { select: { firstName: true, lastName: true, memberId: true } } },
      orderBy: { paidAt: 'desc' },
      take: 5,
    }),
    prisma.member.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, firstName: true, lastName: true, memberId: true, createdAt: true, status: true },
    }),
    prisma.membership.findMany({
      where: {
        gymId,
        status: 'ACTIVE',
        endDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
      include: { member: { select: { firstName: true, lastName: true, memberId: true } } },
      orderBy: { endDate: 'asc' },
      take: 5,
    }),
    prisma.classSchedule.findMany({
      where: {
        gymId,
        isActive: true,
        startDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      include: {
        class: { select: { name: true, color: true } },
        trainer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),
    // Chart data - last 6 months revenue
    getRevenueSeries(gymId),
    // Membership growth
    getMemberGrowthSeries(gymId),
    // Attendance by day of week
    getAttendanceByDowSeries(gymId),
  ])

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    include: { branding: true, subscription: { include: { plan: true } } },
  })

  return (
    <DashboardClient
      gym={gym}
      stats={{
        activeMembers,
        newMembersThisMonth,
        todayAttendance,
        expiringSoon,
        todayRevenue: todayRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        outstandingPayments: outstandingPayments._sum.total || 0,
        activeClasses,
      }}
      recentPayments={recentPayments}
      recentMembers={recentMembers}
      upcomingExpirations={upcomingExpirations}
      upcomingClasses={upcomingClasses}
      revenueChartData={revenueChartData as any[]}
      membershipGrowthData={membershipGrowthData as any[]}
      attendanceChartData={attendanceChartData as any[]}
      greeting={getGreeting()}
      userName={session.user.name || 'Admin'}
    />
  )
}