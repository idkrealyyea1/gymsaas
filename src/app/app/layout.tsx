'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  UserPlus,
  Dumbbell,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  DollarSign,
  Activity,
  Target,
  FileText,
  Truck,
  ClipboardCheck,
  Zap,
  Shield,
} from 'lucide-react'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Management',
    icon: Users,
    items: [
      { title: 'Members', href: '/app/members', icon: Users },
      { title: 'Memberships', href: '/app/memberships', icon: CreditCard },
      { title: 'Attendance', href: '/app/attendance', icon: Calendar },
      { title: 'Check-in', href: '/app/checkin', icon: UserPlus },
    ],
  },
  {
    title: 'Business',
    icon: DollarSign,
    items: [
      { title: 'Payments', href: '/app/payments', icon: CreditCard },
      { title: 'Invoices', href: '/app/invoices', icon: FileText },
      { title: 'Expenses', href: '/app/expenses', icon: Truck },
      { title: 'Reports', href: '/app/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Operations',
    icon: Activity,
    items: [
      { title: 'Classes', href: '/app/classes', icon: Dumbbell },
      { title: 'Schedules', href: '/app/schedules', icon: Calendar },
      { title: 'Bookings', href: '/app/bookings', icon: ClipboardCheck },
      { title: 'Trainers', href: '/app/trainers', icon: Target },
    ],
  },
  {
    title: 'Growth',
    icon: Zap,
    items: [
      { title: 'Leads', href: '/app/leads', icon: UserPlus },
      { title: 'Workout Plans', href: '/app/workouts', icon: ClipboardList },
      { title: 'Equipment', href: '/app/equipment', icon: Dumbbell },
    ],
  },
  {
    title: 'Analytics',
    href: '/app/analytics',
    icon: BarChart3,
  },
]

function SidebarNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [openMobile, setOpenMobile] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useGymTheme()

  return (
    <Sidebar
      className="h-screen border-r transition-all duration-200"
      style={{
        backgroundColor: theme.sidebar,
        borderColor: theme.border,
        width: collapsed ? '72px' : '280px',
      }}
    >
      <SidebarContent className="flex flex-col h-full">
        <div className="flex h-16 items-center justify-between px-4 border-b" style={{ borderColor: theme.border }}>
          {!collapsed && (
            <Link href="/app/dashboard" className="flex items-center gap-2">
              <Building2 className="h-8 w-8" style={{ color: theme.accent }} />
              <span className="font-bold text-lg" style={{ color: theme.text }}>
                Gym Admin
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <SidebarGroup className="flex-1 overflow-y-auto">
          <SidebarGroupLabel className={cn('px-4 py-2 text-xs font-semibold text-muted-foreground', collapsed && 'hidden')}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                if ('items' in item) {
                  return (
                    <SidebarMenuSub key={item.title}>
                      <SidebarMenuSubButton
                        tooltip={collapsed ? item.title : undefined}
                        className={cn(
                          collapsed && 'justify-center px-2',
                          'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
                        )}
                        style={{ color: theme.text }}
                      >
                        <item.icon className="h-5 w-5" aria-hidden="true" style={{ color: theme.textMuted }} />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuSubButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === subItem.href}
                              tooltip={collapsed ? subItem.title : undefined}
                              className={cn(
                                collapsed && 'justify-center px-2',
                                'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground'
                              )}
                              style={{
                                color: theme.text,
                                backgroundColor: pathname === subItem.href ? theme.accent : 'transparent',
                              }}
                            >
                              <subItem.icon className="h-4 w-4" aria-hidden="true" />
                              {!collapsed && <span>{subItem.title}</span>}
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarMenuSub>
                  )
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={collapsed ? item.title : undefined}
                      className={cn(
                        collapsed && 'justify-center px-2',
                        'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground'
                      )}
                      style={{
                        color: theme.text,
                        backgroundColor: pathname === item.href ? theme.accent : 'transparent',
                      }}
                    >
                      <item.icon className="h-5 w-5" aria-hidden="true" style={{ color: theme.textMuted }} />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="border-t p-4" style={{ borderColor: theme.border }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  'w-full justify-start gap-3',
                  collapsed && 'justify-center px-2'
                )}
                style={{ color: theme.text }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback className="text-xs font-medium" style={{ backgroundColor: theme.accent, color: theme.accentForeground }}>
                    {session?.user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" style={{ backgroundColor: theme.surface }}>
              <div className="p-2 border-b" style={{ borderColor: theme.border }}>
                <p className="font-medium text-sm">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/app/settings" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/profile" className="flex items-center gap-2 w-full">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}

import { User } from 'lucide-react'

function Header({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [openMobile, setOpenMobile] = useState(false)
  const { theme } = useGymTheme()

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ borderColor: theme.border, backgroundColor: theme.background }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpenMobile(!openMobile)}
        aria-label="Toggle menu"
      >
        {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-xs text-white flex items-center justify-center">3</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80" style={{ backgroundColor: theme.surface }}>
            <div className="p-2 border-b" style={{ borderColor: theme.border }}>
              <h4 className="font-medium">Notifications</h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="p-2 hover:bg-accent/50" style={{ color: theme.text }}>
                <p className="text-sm font-medium">New member joined</p>
                <p className="text-xs text-muted-foreground">John Doe just signed up</p>
                <p className="text-xs text-muted-foreground">2 min ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-2 hover:bg-accent/50" style={{ color: theme.text }}>
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">$150 from Jane Smith</p>
                <p className="text-xs text-muted-foreground">15 min ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-2 hover:bg-accent/50" style={{ color: theme.text }}>
                <p className="text-sm font-medium">Membership expiring</p>
                <p className="text-xs text-muted-foreground">Mike Johnson expires in 3 days</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-center">
              <Link href="/app/notifications" className="w-full">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border hidden sm:block" style={{ backgroundColor: theme.border }} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                <AvatarFallback className="text-xs font-medium" style={{ backgroundColor: theme.accent, color: theme.accentForeground }}>
                  {session?.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ backgroundColor: theme.surface }}>
            <div className="p-2 border-b" style={{ borderColor: theme.border }}>
              <p className="font-medium text-sm">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/profile" className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GymThemeProvider>
      <div className="flex h-screen bg-background" style={{ backgroundColor: '#0F0F0F' }}>
        <SidebarNav />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </GymThemeProvider>
  )
}