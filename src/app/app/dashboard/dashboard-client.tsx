'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, daysUntil } from '@/lib/utils'
import {
  Users,
  UserPlus,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Truck,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color: string
  href?: string
}

function StatCard({ title, value, icon, trend, color, href }: StatCardProps) {
  const { theme } = useGymTheme()
  
  return (
    <Card className="card-hover" style={{ borderColor: theme.border }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: theme.text }}>{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.value >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm" style={{ color: trend.value >= 0 ? 'green' : 'red' }}>
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, children, className }: ChartCardProps) {
  const { theme } = useGymTheme()
  
  return (
    <Card className={className} style={{ borderColor: theme.border }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg" style={{ color: theme.text }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function QuickActionButton({ icon, label, href, color }: { icon: React.ReactNode; label: string; href: string; color: string }) {
  const { theme } = useGymTheme()
  
  return (
    <a href={href} className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <div className="p-3 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <span className="text-sm font-medium text-center" style={{ color: theme.text }}>{label}</span>
    </a>
  )
}

export function DashboardClient({
  gym,
  stats,
  recentPayments,
  recentMembers,
  upcomingExpirations,
  upcomingClasses,
  revenueChartData,
  membershipGrowthData,
  attendanceChartData,
  greeting,
  userName,
}: any) {
  const { theme } = useGymTheme()
  const [revenueData, setRevenueData] = React.useState<any[]>([])
  const [membershipData, setMembershipData] = React.useState<any[]>([])
  const [attendanceData, setAttendanceData] = React.useState<any[]>([])

  React.useEffect(() => {
    // Process revenue data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revMap = new Map(revenueChartData.map((d: any) => [new Date(d.month).getMonth(), Number(d.revenue)]))
    setRevenueData(months.slice(-6).map((m, i) => ({
      month: m,
      revenue: revMap.get((new Date().getMonth() - 5 + i + 12) % 12) || 0,
    })))

    // Process membership growth
    const memMap = new Map(membershipGrowthData.map((d: any) => [new Date(d.month).getMonth(), Number(d.count)]))
    setMembershipData(months.slice(-6).map((m, i) => ({
      month: m,
      members: memMap.get((new Date().getMonth() - 5 + i + 12) % 12) || 0,
    })))

    // Process attendance by day
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const attMap = new Map(attendanceChartData.map((d: any) => [Number(d.day), Number(d.count)]))
    setAttendanceData(days.map((d, i) => ({
      day: d,
      count: attMap.get(i) || 0,
    })))
  }, [revenueChartData, membershipGrowthData, attendanceChartData])

  const primaryColor = theme.primary
  const accentColor = theme.accent

  return (
    <GymThemeProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
              {greeting}, {userName}
            </h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening at {gym?.name || 'your gym'} today</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/app/members">Add Member</a>
            </Button>
            <Button asChild style={{ backgroundColor: primaryColor }}>
              <a href="/app/checkin">Check-in</a>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickActionButton icon={<UserPlus className="h-5 w-5" />} label="Add Member" href="/app/members" color={primaryColor} />
          <QuickActionButton icon={<DollarSign className="h-5 w-5" />} label="Record Payment" href="/app/payments/new" color={accentColor} />
          <QuickActionButton icon={<Calendar className="h-5 w-5" />} label="Check Attendance" href="/app/checkin" color="#3B82F6" />
          <QuickActionButton icon={<CreditCard className="h-5 w-5" />} label="Create Membership" href="/app/memberships/new" color="#8B5CF6" />
          <QuickActionButton icon={<Dumbbell className="h-5 w-5" />} label="Add Class" href="/app/classes/new" color="#F59E0B" />
          <QuickActionButton icon={<Truck className="h-5 w-5" />} label="Add Expense" href="/app/expenses/new" color="#EF4444" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 12, label: 'vs last month' }}
            color={primaryColor}
            href="/app/members"
          />
          <StatCard
            title="Today&apos;s Attendance"
            value={stats.todayAttendance}
            icon={<Calendar className="h-6 w-6" />}
            trend={{ value: 8, label: 'vs yesterday' }}
            color={accentColor}
            href="/app/attendance"
          />
          <StatCard
            title="Today&apos;s Revenue"
            value={formatCurrency(stats.todayRevenue, gym?.currency || 'USD')}
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 15, label: 'vs last week' }}
            color="#3B82F6"
            href="/app/payments"
          />
          <StatCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="#EF4444"
            href="/app/memberships?filter=expiring"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Revenue (Last 6 Months)" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="month" stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <YAxis stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} tickFormatter={(v) => formatCurrency(v, gym?.currency || 'USD')} />
                <Tooltip
                  contentStyle={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px' }}
                  formatter={(v: number) => [formatCurrency(v, gym?.currency || 'USD'), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={accentColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Membership Growth" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={membershipData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="month" stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <YAxis stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px' }}
                  formatter={(v: number) => [v, 'New Members']}
                />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke={primaryColor}
                  strokeWidth={2}
                  dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Weekly Attendance Pattern" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                <XAxis dataKey="day" stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <YAxis stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill={accentColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Active Classes" className="h-[350px]">
            <div className="space-y-4">
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming classes scheduled</p>
                  <Button asChild className="mt-4" variant="outline">
                    <a href="/app/classes/new">Create Class</a>
                  </Button>
                </div>
              ) : (
                upcomingClasses.map((cls: any) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cls.class?.color || accentColor}20`, color: cls.class?.color || accentColor }}>
                        <Dumbbell className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: theme.text }}>{cls.class?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cls.trainer ? `${cls.trainer.firstName} ${cls.trainer.lastName}` : 'No trainer'} • {cls.startTime} - {cls.endTime}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" style={{ borderColor: theme.border }}>
                      {cls.dayOfWeek === 0 ? 'Sun' : cls.dayOfWeek === 1 ? 'Mon' : cls.dayOfWeek === 2 ? 'Tue' : cls.dayOfWeek === 3 ? 'Wed' : cls.dayOfWeek === 4 ? 'Thu' : cls.dayOfWeek === 5 ? 'Fri' : 'Sat'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>

        {/* Bottom Row - Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between" style={{ color: theme.text }}>
                Recent Payments
                <Button variant="ghost" size="sm" asChild>
                  <a href="/app/payments">View all</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No recent payments</p>
                ) : (
                  recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.surface }}>
                      <div>
                        <p className="font-medium" style={{ color: theme.text }}>
                          {payment.member?.firstName} {payment.member?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.member?.memberId} • {formatDate(payment.paidAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: theme.text }}>
                          {formatCurrency(payment.total, payment.currency)}
                        </p>
                        <Badge variant="success" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between" style={{ color: theme.text }}>
                Recent Members
                <Button variant="ghost" size="sm" asChild>
                  <a href="/app/members">View all</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMembers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No recent members</p>
                ) : (
                  recentMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.surface }}>
                      <div>
                        <p className="font-medium" style={{ color: theme.text }}>
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.memberId} • {formatDate(member.createdAt)}</p>
                      </div>
                      <Badge variant={member.status === 'ACTIVE' ? 'success' : 'outline'} style={{ borderColor: theme.border }}>
                        {getStatusLabel(member.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between" style={{ color: theme.text }}>
                Expiring Memberships
                <Button variant="ghost" size="sm" asChild>
                  <a href="/app/memberships?filter=expiring">View all</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExpirations.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No expiring memberships</p>
                ) : (
                  upcomingExpirations.map((membership: any) => (
                    <div key={membership.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.surface }}>
                      <div>
                        <p className="font-medium" style={{ color: theme.text }}>
                          {membership.member?.firstName} {membership.member?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{membership.member?.memberId} • {membership.plan?.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={daysUntil(membership.endDate) <= 3 ? 'warning' : 'outline'} style={{ borderColor: theme.border }}>
                          {daysUntil(membership.endDate)} days
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(membership.endDate)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GymThemeProvider>
  )
}