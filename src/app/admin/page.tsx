import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/tenant'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getRevenueSeries, getGymGrowthSeries } from '@/lib/chart-data'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { AdminDashboardClient } from './admin-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== UserRole.SUPER_ADMIN) {
    redirect('/app/dashboard')
  }

  const context = await requireSuperAdmin()

  // Get platform stats
  const [
    totalGyms,
    activeGyms,
    trialGyms,
    expiredGyms,
    suspendedGyms,
    totalMembers,
    monthlyRevenue,
    newGymsThisMonth,
    newMembersThisMonth,
    recentGyms,
    subscriptionStats,
    revenueChartData,
    gymGrowthData,
  ] = await Promise.all([
    prisma.gym.count(),
    prisma.gym.count({ where: { isActive: true, isSuspended: false } }),
    prisma.gym.count({ where: { isActive: true, trialEndsAt: { gte: new Date() } } }),
    prisma.gym.count({ where: { isActive: false } }),
    prisma.gym.count({ where: { isSuspended: true } }),
    prisma.member.count({ where: { isActive: true } }),
    prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { total: true },
    }),
    prisma.gym.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.member.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.gym.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: { include: { plan: true } },
        users: true,
        _count: { select: { members: true, users: true } },
      },
    }),
    prisma.subscription.groupBy({
      by: ['status'],
      _count: true,
    }),
    getRevenueSeries(),
    getGymGrowthSeries(),
  ])

  const platformSettings = await prisma.platformSettings.findFirst()

  return (
    <AdminDashboardClient
      platformName={platformSettings?.platformName || 'FITCORE'}
      stats={{
        totalGyms,
        activeGyms,
        trialGyms,
        expiredGyms,
        suspendedGyms,
        totalMembers,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        newGymsThisMonth,
        newMembersThisMonth,
      }}
      recentGyms={recentGyms}
      subscriptionStats={subscriptionStats}
      revenueChartData={revenueChartData as any[]}
      gymGrowthData={gymGrowthData as any[]}
    />
  )
}