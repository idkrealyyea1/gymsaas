'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Pagination } from '@/components/ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getInitials } from '@/lib/utils'
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Calendar,
  UserPlus,
  QrCode,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'
import { toast } from 'sonner'

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  notes: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

interface MembersClientProps {
  gym: any
  members: any[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  filters: { search: string; status: string }
  statuses: string[]
}

export function MembersClient({ gym, members, pagination, filters, statuses }: MembersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useGymTheme()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [deletingMember, setDeletingMember] = useState<string | null>(null)

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      notes: '',
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget as HTMLFormElement)
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', data.get('search') as string)
    params.set('page', '1')
    router.push(`/app/members?${params.toString()}`)
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) params.set('status', status)
    else params.delete('status')
    params.set('page', '1')
    router.push(`/app/members?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/app/members?${params.toString()}`)
  }

  const onSubmit = async (data: MemberFormData) => {
    try {
      const body = {
        ...data,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        emergencyContact: data.emergencyContactName ? {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relation: data.emergencyContactRelation,
        } : null,
      }

      const url = editingMember ? `/api/app/members/${editingMember.id}` : '/api/app/members'
      const method = editingMember ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to save member')
      }

      toast.success(editingMember ? 'Member updated' : 'Member created')
      setIsCreateOpen(false)
      setEditingMember(null)
      form.reset()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/app/members/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete member')
      toast.success('Member deleted')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDeletingMember(null)
    }
  }

  const primaryColor = theme.primary
  const accentColor = theme.accent

  const openCreateDialog = () => {
    setEditingMember(null)
    form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      notes: '',
    })
    setIsCreateOpen(true)
  }

  const openEditDialog = (member: any) => {
    setEditingMember(member)
    form.reset({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth ? String(member.dateOfBirth).slice(0, 10) : '',
      gender: member.gender || '',
      address: member.address || '',
      city: member.city || '',
      country: member.country || '',
      postalCode: member.postalCode || '',
      emergencyContactName: member.emergencyContact?.name || '',
      emergencyContactPhone: member.emergencyContact?.phone || '',
      emergencyContactRelation: member.emergencyContact?.relation || '',
      notes: member.notes || '',
    })
    setIsCreateOpen(true)
  }

  return (
    <GymThemeProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Members</h1>
            <p className="text-muted-foreground">Manage your gym members</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button type="button" style={{ backgroundColor: primaryColor }} onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl><Input placeholder="John" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl><Input placeholder="+1 555 000 0000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input placeholder="New York" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl><Input placeholder="USA" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl><Input placeholder="10001" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: theme.border }}>
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl><Input placeholder="+1 555 000 0000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactRelation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relation</FormLabel>
                          <FormControl><Input placeholder="Spouse" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <textarea className="input-field min-h-[80px] resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: theme.border }}>
                    <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditingMember(null); form.reset(); }}>
                      Cancel
                    </Button>
                    <Button type="submit" style={{ backgroundColor: primaryColor }}>
                      {editingMember ? 'Update' : 'Create Member'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card style={{ borderColor: theme.border }}>
          <CardHeader className="pb-2">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search members..."
                  value={filters.search}
                  className="pl-10"
                />
              </div>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </form>
          </CardHeader>
          <CardContent>
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No members found.{' '}
                        <Button variant="link" onClick={openCreateDialog} className="ml-2">
                          Add your first member
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.profilePhotoUrl || ''} alt={`${member.firstName} ${member.lastName}`} />
                              <AvatarFallback className="text-sm font-medium" style={{ backgroundColor: accentColor, color: theme.accentForeground }}>
                                {getInitials(`${member.firstName} ${member.lastName}`)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium" style={{ color: theme.text }}>{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-muted-foreground">{member.email || 'No email'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium" style={{ color: theme.text }}>{member.memberId}</TableCell>
                        <TableCell>
                          <p className="text-sm" style={{ color: theme.text }}>{member.phone || '-'}</p>
                        </TableCell>
                        <TableCell>
                          {member.memberships[0] ? (
                            <span className="font-medium" style={{ color: theme.text }}>{member.memberships[0].plan?.name}</span>
                          ) : (
                            <span className="text-muted-foreground">No active membership</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(member.status)}>
                            {getStatusLabel(member.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.memberships[0] ? (
                            <>
                              <p className="text-sm" style={{ color: theme.text }}>{formatDate(member.memberships[0].endDate)}</p>
                              <p className="text-xs text-muted-foreground">{daysUntil(member.memberships[0].endDate)} days left</p>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member._count.attendance > 0 ? (
                            <span className="text-sm text-muted-foreground">Today</span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingMember(member.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} members
                </p>
                <Pagination>
                  <Pagination.Previous
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  />
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) pageNum = i + 1
                    else if (pagination.page <= 3) pageNum = i + 1
                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i
                    else pageNum = pagination.page - 2 + i
                    return (
                      <Pagination.Item key={pageNum}>
                        <Button
                          variant={pagination.page === pageNum ? 'default' : 'outline'}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </Pagination.Item>
                    )
                  })}
                  <Pagination.Next
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  />
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {deletingMember && (
          <Dialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Member</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this member? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDeletingMember(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDelete(deletingMember!)}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </GymThemeProvider>
  )
}

function daysUntil(date: string | Date): number {
  const target = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}