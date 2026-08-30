'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'
import Link from 'next/link'

interface AdminDashboardClientProps {
  platformName: string
  stats: {
    totalGyms: number
    activeGyms: number
    trialGyms: number
    expiredGyms: number
    suspendedGyms: number
    totalMembers: number
    monthlyRevenue: number
    newGymsThisMonth: number
    newMembersThisMonth: number
  }
  recentGyms: any[]
  subscriptionStats: any[]
  revenueChartData: any[]
  gymGrowthData: any[]
}

export function AdminDashboardClient({
  platformName,
  stats,
  recentGyms,
  subscriptionStats,
  revenueChartData,
  gymGrowthData,
}: AdminDashboardClientProps) {
  const { theme } = useGymTheme()
  const [revenueData, setRevenueData] = React.useState<any[]>([])
  const [growthData, setGrowthData] = React.useState<any[]>([])

  React.useEffect(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revMap = new Map(revenueChartData.map((d: any) => [new Date(d.month).getMonth(), Number(d.revenue)]))
    setRevenueData(months.slice(-6).map((m, i) => ({
      month: m,
      revenue: revMap.get((new Date().getMonth() - 5 + i + 12) % 12) || 0,
    })))

    const growthMap = new Map(gymGrowthData.map((d: any) => [new Date(d.month).getMonth(), Number(d.count)]))
    setGrowthData(months.slice(-6).map((m, i) => ({
      month: m,
      gyms: growthMap.get((new Date().getMonth() - 5 + i + 12) % 12) || 0,
    })))
  }, [revenueChartData, gymGrowthData])

  const primaryColor = '#111827'
  const accentColor = '#22C55E'

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'TRIAL': return 'info'
      case 'PAST_DUE': return 'warning'
      case 'SUSPENDED': return 'destructive'
      case 'CANCELLED': return 'destructive'
      case 'EXPIRED': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <GymThemeProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
              <Building2 className="h-6 w-6" style={{ color: accentColor }} />
              {platformName} Admin
            </h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
          <Button asChild style={{ backgroundColor: primaryColor }}>
            <Link href="/admin/gyms/new"><Plus className="h-4 w-4 mr-2" />Add Gym</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Gyms" value={stats.totalGyms} icon={<Building2 className="h-6 w-6" />} color={primaryColor} />
          <StatCard title="Active Gyms" value={stats.activeGyms} icon={<CheckCircle className="h-6 w-6" />} color={accentColor} />
          <StatCard title="Trial Gyms" value={stats.trialGyms} icon={<Clock className="h-6 w-6" />} color="#3B82F6" />
          <StatCard title="Total Members" value={stats.totalMembers.toLocaleString()} icon={<Users className="h-6 w-6" />} color="#8B5CF6" />
          <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} icon={<DollarSign className="h-6 w-6" />} color="#F59E0B" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Platform Revenue (Last 6 Months)" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="month" stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <YAxis stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip contentStyle={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px' }} formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke={accentColor} strokeWidth={2} fillOpacity={1} fill="url(#adminRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New Gyms per Month" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                <XAxis dataKey="month" stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <YAxis stroke={theme.textMuted} tick={{ fill: theme.textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
                <Bar dataKey="gyms" fill={primaryColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Subscription Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between" style={{ color: theme.text }}>
                Subscription Status
                <Button variant="ghost" size="sm" asChild><Link href="/admin/subscriptions">View all</Link></Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptionStats.map((stat: any) => (
                  <div key={stat.status} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className="flex items-center gap-3">
                      <Badge variant={getSubscriptionStatusColor(stat.status) as any}>{getStatusLabel(stat.status)}</Badge>
                    </div>
                    <span className="font-bold" style={{ color: theme.text }}>{stat._count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between" style={{ color: theme.text }}>
                Recent Gyms
                <Button variant="ghost" size="sm" asChild><Link href="/admin/gyms">View all</Link></Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gym</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentGyms.map((gym: any) => (
                      <TableRow key={gym.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                              <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium" style={{ color: theme.text }}>{gym.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {gym.users.find((u: any) => u.role === 'GYM_OWNER') ? (
                            <span style={{ color: theme.text }}>{gym.users.find((u: any) => u.role === 'GYM_OWNER')?.name}</span>
                          ) : (
                            <span className="text-muted-foreground">No owner</span>
                          )}
                        </TableCell>
                        <TableCell><span style={{ color: theme.text }}>{gym._count.members}</span></TableCell>
                        <TableCell><span style={{ color: theme.text }}>{gym._count.users}</span></TableCell>
                        <TableCell>
                          {gym.subscription?.plan?.name || 'No plan'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSubscriptionStatusColor(gym.subscription?.status || 'EXPIRED') as any} style={{ borderColor: theme.border }}>
                            {getStatusLabel(gym.subscription?.status || 'EXPIRED')}
                          </Badge>
                        </TableCell>
                        <TableCell><span className="text-muted-foreground">{formatDate(gym.createdAt)}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card style={{ borderColor: theme.border }}>
          <CardHeader>
            <CardTitle style={{ color: theme.text }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2" style={{ backgroundColor: theme.surface }}>
                <Link href="/admin/gyms/new"><Plus className="h-8 w-8" style={{ color: accentColor }} /><span>Add New Gym</span></Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2" style={{ backgroundColor: theme.surface }}>
                <Link href="/admin/gyms"><Building2 className="h-8 w-8" style={{ color: primaryColor }} /><span>Manage Gyms</span></Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2" style={{ backgroundColor: theme.surface }}>
                <Link href="/admin/subscriptions"><DollarSign className="h-8 w-8" style={{ color: '#F59E0B' }} /><span>Subscriptions</span></Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2" style={{ backgroundColor: theme.surface }}>
                <Link href="/admin/analytics"><BarChart3 className="h-8 w-8" style={{ color: '#8B5CF6' }} /><span>Platform Analytics</span></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </GymThemeProvider>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const { theme } = useGymTheme()
  return (
    <Card style={{ borderColor: theme.border }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: theme.text }}>{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
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