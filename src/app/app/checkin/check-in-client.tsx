'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, formatTime, getStatusColor, getStatusLabel, getInitials } from '@/lib/utils'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'
import { CheckCircle, XCircle, AlertCircle, Clock, Search, QrCode, Plus, UserPlus, CreditCard, Calendar, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface CheckInPageProps {
  gym: any
  recentAttendance: any[]
  activeMembersToday: number
  currentlyInside: number
}

export default function CheckInClient({
  gym,
  recentAttendance = [],
  activeMembersToday = 0,
  currentlyInside = 0,
}: CheckInPageProps) {
  const { theme } = useGymTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  const primaryColor = theme.primary
  const accentColor = theme.accent

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const res = await fetch(`/api/app/members/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.members || [])
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCheckIn = async (memberId: string) => {
    setIsCheckingIn(true)
    try {
      const res = await fetch('/api/app/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Check-in failed')
      toast.success('Check-in successful')
      setSelectedMember(null)
      setSearchQuery('')
      setSearchResults([])
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async (attendanceId: string) => {
    try {
      const res = await fetch('/api/app/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Check-out failed')
      toast.success('Check-out successful')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getMembershipStatus = (member: any) => {
    const activeMembership = member.memberships?.find((m: any) => m.status === 'ACTIVE')
    if (!activeMembership) return { status: 'EXPIRED', label: 'No Active Membership', color: 'destructive' }
    const daysLeft = Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return { status: 'EXPIRED', label: 'Expired', color: 'destructive' }
    if (daysLeft <= 3) return { status: 'EXPIRING', label: `Expires in ${daysLeft} days`, color: 'warning' }
    return { status: 'ACTIVE', label: 'Active', color: 'success' }
  }

  return (
    <GymThemeProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Check-in</h1>
            <p className="text-muted-foreground">Member attendance tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/app/members"><Plus className="h-4 w-4 mr-2" />Add Member</Link>
            </Button>
            <Button asChild style={{ backgroundColor: primaryColor }}>
              <Link href="/app/members"><UserPlus className="h-4 w-4 mr-2" />All Members</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card style={{ borderColor: theme.border }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                  <p className="text-3xl font-bold" style={{ color: theme.text }}>{activeMembersToday}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card style={{ borderColor: theme.border }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currently Inside</p>
                  <p className="text-3xl font-bold" style={{ color: theme.text }}>{currentlyInside}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  <UserPlus className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card style={{ borderColor: theme.border }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quick Check-in</p>
                  <p className="text-3xl font-bold" style={{ color: theme.text }}>
                    <Button variant="outline" size="icon" asChild style={{ padding: 0 }}>
                      <Link href="/app/checkin/scan"><QrCode className="h-8 w-8" /></Link>
                    </Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Member Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between" style={{ color: theme.text }}>
                Search Member
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/app/checkin/scan"><QrCode className="h-5 w-5" /></Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, member ID, phone, or email..."
                    className="pl-11 text-lg py-3"
                    autoFocus
                  />
                </div>
              </form>

              {isSearching && <p className="text-center text-muted-foreground py-6">Searching...</p>}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No members found</p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((m: any) => {
                    const membership = getMembershipStatus(m)
                    return (
                      <Button
                        key={m.id}
                        variant="outline"
                        className="w-full justify-start gap-4 p-3"
                        onClick={() => setSelectedMember(m)}
                        style={{ borderColor: theme.border, backgroundColor: selectedMember?.id === m.id ? `${accentColor}10` : theme.surface }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={m.profilePhotoUrl || ''} alt={`${m.firstName} ${m.lastName}`} />
                          <AvatarFallback className="text-sm font-medium" style={{ backgroundColor: accentColor, color: theme.accentForeground }}>
                            {getInitials(`${m.firstName} ${m.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: theme.text }}>{m.firstName} {m.lastName}</p>
                          <p className="text-sm text-muted-foreground">{m.memberId} • {m.phone}</p>
                        </div>
                        <Badge variant={membership.color as any} className="text-xs">
                          {membership.label}
                        </Badge>
                      </Button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Member Card */}
          <Card style={{ borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>{selectedMember ? 'Member Details' : 'Select a Member'}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedMember.profilePhotoUrl || ''} alt={`${selectedMember.firstName} ${selectedMember.lastName}`} />
                      <AvatarFallback className="text-xl font-medium" style={{ backgroundColor: accentColor, color: theme.accentForeground }}>
                        {getInitials(`${selectedMember.firstName} ${selectedMember.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold" style={{ color: theme.text }}>
                        {selectedMember.firstName} {selectedMember.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedMember.memberId}</p>
                    </div>
                  </div>

                  <Separator style={{ backgroundColor: theme.border }} />

                  <div className="space-y-2">
                    {selectedMember.memberships && selectedMember.memberships.length > 0 ? (
                      selectedMember.memberships.map((mship: any) => {
                        const membership = getMembershipStatus({ memberships: [mship] })
                        return (
                          <div key={mship.id} className="p-3 rounded-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium" style={{ color: theme.text }}>{mship.plan?.name}</span>
                              <Badge variant={membership.color as any}>{membership.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Expires: {formatDate(mship.endDate)} ({Math.ceil((new Date(mship.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)
                            </p>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No active membership</p>
                    )}
                  </div>

                  <Separator style={{ backgroundColor: theme.border }} />

                  {selectedMember.memberships?.some((m: any) => m.status === 'ACTIVE') ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleCheckIn(selectedMember.id)}
                      disabled={isCheckingIn}
                      style={{ backgroundColor: accentColor }}
                    >
                      {isCheckingIn ? 'Checking in...' : 'Check In'}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/app/members/${selectedMember.id}/memberships/new`}>Create Membership</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Search for a member to check them in</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card style={{ borderColor: theme.border }}>
          <CardHeader>
            <CardTitle style={{ color: theme.text }}>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No attendance records today</TableCell>
                    </TableRow>
                  ) : (
                    recentAttendance.map((att: any) => (
                      <TableRow key={att.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={att.member?.profilePhotoUrl || ''} alt={`${att.member?.firstName} ${att.member?.lastName}`} />
                              <AvatarFallback className="text-xs font-medium" style={{ backgroundColor: accentColor, color: theme.accentForeground }}>
                                {getInitials(`${att.member?.firstName} ${att.member?.lastName}`)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium" style={{ color: theme.text }}>{att.member?.firstName} {att.member?.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm" style={{ color: theme.text }}>{att.member?.memberId}</TableCell>
                        <TableCell><span style={{ color: theme.text }}>{formatTime(att.checkInAt)}</span></TableCell>
                        <TableCell><span style={{ color: theme.text }}>{att.checkOutAt ? formatTime(att.checkOutAt) : '-'}</span></TableCell>
                        <TableCell>
                          {att.checkOutAt ? (
                            <span style={{ color: theme.text }}>
                              {Math.round((new Date(att.checkOutAt).getTime() - new Date(att.checkInAt).getTime()) / (1000 * 60))} min
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={att.status === 'CHECKED_IN' ? 'success' : 'outline'} style={{ borderColor: theme.border }}>
                            {getStatusLabel(att.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {att.status === 'CHECKED_IN' && (
                            <Button variant="outline" size="sm" onClick={() => handleCheckOut(att.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Check-out
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </GymThemeProvider>
  )
}