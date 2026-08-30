'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'
import { Building2, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Pause, Play, UserPlus, Key, ExternalLink, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

interface AdminGymsClientProps {
  gyms: any[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  filters: { search: string; status: string }
}

export function AdminGymsClient({ gyms, pagination, filters }: AdminGymsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useGymTheme()
  const [suspendingGym, setSuspendingGym] = React.useState<string | null>(null)
  const [activatingGym, setActivatingGym] = React.useState<string | null>(null)
  const [deletingGym, setDeletingGym] = React.useState<string | null>(null)
  const [suspendingReason, setSuspendingReason] = React.useState('')

  const primaryColor = '#111827'
  const accentColor = '#22C55E'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget as HTMLFormElement)
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', data.get('search') as string)
    params.set('page', '1')
    router.push(`/admin/gyms?${params.toString()}`)
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) params.set('status', status)
    else params.delete('status')
    params.set('page', '1')
    router.push(`/admin/gyms?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/gyms?${params.toString()}`)
  }

  const handleSuspend = async (gymId: string) => {
    if (!suspendingReason.trim()) {
      toast.error('Please provide a reason for suspension')
      return
    }
    try {
      const res = await fetch(`/api/admin/gyms/${gymId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspendingReason }),
      })
      if (!res.ok) throw new Error('Failed to suspend gym')
      toast.success('Gym suspended')
      setSuspendingGym(null)
      setSuspendingReason('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleActivate = async (gymId: string) => {
    try {
      const res = await fetch(`/api/admin/gyms/${gymId}/activate`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to activate gym')
      toast.success('Gym activated')
      setActivatingGym(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (gymId: string) => {
    try {
      const res = await fetch(`/api/admin/gyms/${gymId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete gym')
      toast.success('Gym deleted')
      setDeletingGym(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getGymStatus = (gym: any) => {
    if (gym.isSuspended) return { label: 'Suspended', color: 'destructive' as const }
    if (!gym.isActive) return { label: 'Inactive', color: 'outline' as const }
    if (gym.trialEndsAt && new Date(gym.trialEndsAt) > new Date()) return { label: 'Trial', color: 'info' as const }
    return { label: 'Active', color: 'success' as const }
  }

  return (
    <GymThemeProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
              <Building2 className="h-6 w-6" style={{ color: primaryColor }} />
              Gym Management
            </h1>
            <p className="text-muted-foreground">Manage all gyms on the platform</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: primaryColor }}><Plus className="h-4 w-4 mr-2" />Add Gym</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Gym</DialogTitle>
              </DialogHeader>
              <GymCreationWizard onSuccess={() => router.refresh()} />
            </DialogContent>
          </Dialog>
        </div>

        <Card style={{ borderColor: theme.border }}>
          <CardHeader className="pb-2">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" placeholder="Search gyms..." value={filters.search} className="pl-10" />
              </div>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </form>
          </CardHeader>
          <CardContent>
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gym</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gyms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No gyms found. <Button variant="link" asChild className="ml-2"><Link href="/admin/gyms/new">Create your first gym</Link></Button>
                      </TableCell>
                    </TableRow>
                  ) : gyms.map((gym) => {
                      const status = getGymStatus(gym)
                      const owner = gym.users?.find((u: any) => u.role === 'GYM_OWNER')
                      return (
                        <TableRow key={gym.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm font-medium" style={{ backgroundColor: gym.branding?.primaryColor || primaryColor, color: gym.branding?.primaryColor ? '#fff' : '#fff' }}>
                                  {gym.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium" style={{ color: theme.text }}>{gym.name}</p>
                                <p className="text-sm text-muted-foreground">{gym.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {owner ? (
                              <div>
                                <p className="font-medium" style={{ color: theme.text }}>{owner.name}</p>
                                <p className="text-sm text-muted-foreground">{owner.email}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No owner assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm" style={{ color: theme.text }}>{gym.email}</p>
                            <p className="text-xs text-muted-foreground">{gym.phone || 'No phone'}</p>
                          </TableCell>
                          <TableCell><span style={{ color: theme.text }}>{gym._count.members}</span></TableCell>
                          <TableCell><span style={{ color: theme.text }}>{gym._count.users}</span></TableCell>
                          <TableCell>
                            {gym.subscription?.plan?.name ? (
                              <span style={{ color: theme.text }}>{gym.subscription.plan.name}</span>
                            ) : (
                              <span className="text-muted-foreground">No plan</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.color} style={{ borderColor: theme.border }}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell><span className="text-muted-foreground">{formatDate(gym.createdAt)}</span></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" asChild><Link href={`/admin/gyms/${gym.id}`}><Eye className="h-4 w-4" /></Link></Button>
                              <Button variant="ghost" size="icon" asChild><Link href={`/admin/gyms/${gym.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                              <Button variant="ghost" size="icon" asChild><Link href={`/app/dashboard?gym=${gym.slug}`}><ExternalLink className="h-4 w-4" /></Link></Button>
                              {!gym.isSuspended ? (
                                <Button variant="ghost" size="icon" onClick={() => setSuspendingGym(gym.id)}>
                                  <Pause className="h-4 w-4 text-yellow-500" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => setActivatingGym(gym.id)}>
                                  <Play className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => setDeletingGym(gym.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} gyms
                </p>
                <Pagination>
                  <Pagination.Prev onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} />
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) pageNum = i + 1
                    else if (pagination.page <= 3) pageNum = i + 1
                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i
                    else pageNum = pagination.page - 2 + i
                    return (
                      <Pagination.Item key={pageNum}>
                        <Button variant={pagination.page === pageNum ? 'default' : 'outline'} onClick={() => handlePageChange(pageNum)}>{pageNum}</Button>
                      </Pagination.Item>
                    )
                  })}
                  <Pagination.Next onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} />
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suspend Dialog */}
        {suspendingGym && (
          <Dialog open={!!suspendingGym} onOpenChange={(open) => !open && setSuspendingGym(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suspend Gym</DialogTitle>
                <DialogDescription>Provide a reason for suspending this gym</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <textarea
                  value={suspendingReason}
                  onChange={(e) => setSuspendingReason(e.target.value)}
                  placeholder="Reason for suspension..."
                  className="input-field min-h-[100px] resize-none"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSuspendingGym(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => handleSuspend(suspendingGym!)}>Suspend</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Activate Confirmation */}
        {activatingGym && (
          <AlertDialog open={!!activatingGym} onOpenChange={(open) => !open && setActivatingGym(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Activate Gym</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to activate this gym?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleActivate(activatingGym!)}>Activate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete Confirmation */}
        {deletingGym && (
          <AlertDialog open={!!deletingGym} onOpenChange={(open) => !open && setDeletingGym(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Gym</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. All gym data will be permanently deleted.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(deletingGym!)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </GymThemeProvider>
  )
}

function GymCreationWizard({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    // Step 1
    name: '', slug: '', description: '', phone: '', email: '', address: '', city: '', country: '', timezone: 'UTC', currency: 'USD',
    // Step 2
    ownerName: '', ownerEmail: '', ownerPhone: '', ownerPassword: '',
    // Step 3
    plan: 'starter',
    // Step 4
    primaryColor: '#111827', secondaryColor: '#374151', accentColor: '#22C55E', backgroundColor: '#0F0F0F', surfaceColor: '#1A1A1A', textColor: '#FFFFFF', sidebarColor: '#111827', buttonColor: '#22C55E', fontFamily: 'Inter',
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/gyms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to create gym')
      toast.success('Gym created successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Gym Info', desc: 'Basic gym information' },
    { number: 2, title: 'Owner', desc: 'Create gym owner account' },
    { number: 3, title: 'Plan', desc: 'Select subscription plan' },
    { number: 4, title: 'Branding', desc: 'Customize gym appearance' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s.number}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.number ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {step > s.number ? <Check className="h-5 w-5" /> : s.number}
              </div>
              <p className="text-xs mt-1 text-center">{s.title}</p>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${step > i + 1 ? 'bg-primary' : 'bg-muted'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Gym Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Gym Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Iron House Fitness" required /></div>
            <div className="space-y-2"><Label>Slug *</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} placeholder="iron-house-fitness" required /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><textarea className="input-field min-h-[80px] resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Gym description..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 555 000 0000" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="info@gym.com" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Address</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St" /></div>
            <div className="space-y-2"><Label>City</Label><Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="New York" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Country</Label><Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="USA" /></div>
            <div className="space-y-2"><Label>Timezone</Label><Select value={formData.timezone} onValueChange={v => setFormData({...formData, timezone: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UTC">UTC</SelectItem><SelectItem value="America/New_York">Eastern Time</SelectItem><SelectItem value="America/Chicago">Central Time</SelectItem><SelectItem value="America/Denver">Mountain Time</SelectItem><SelectItem value="America/Los_Angeles">Pacific Time</SelectItem><SelectItem value="Europe/London">London</SelectItem><SelectItem value="Europe/Paris">Paris</SelectItem><SelectItem value="Asia/Dubai">Dubai</SelectItem><SelectItem value="Asia/Singapore">Singapore</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem><SelectItem value="JOD">JOD</SelectItem><SelectItem value="ILS">ILS (₪)</SelectItem></SelectContent></Select></div>
          <div className="flex justify-end gap-2"><Button type="button" onClick={handleNext}>Next</Button></div>
        </div>
      )}

      {/* Step 2: Owner */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="John Doe" required /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} placeholder="john@gym.com" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Phone</Label><Input value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} placeholder="+1 555 000 0000" /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={formData.ownerPassword} onChange={e => setFormData({...formData, ownerPassword: e.target.value})} placeholder="••••••••" required /></div>
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
            <Button type="button" onClick={handleNext}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 3: Plan */}
      {step === 3 && (
        <div className="space-y-4">
          <Label>Subscription Plan</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['starter', 'professional', 'business', 'enterprise'].map((p) => (
              <Button
                key={p}
                type="button"
                variant={formData.plan === p ? 'default' : 'outline'}
                className="h-32 flex flex-col items-center justify-center gap-2 p-4"
                onClick={() => setFormData({...formData, plan: p})}
                style={formData.plan === p ? { backgroundColor: primaryColor, borderColor: primaryColor } : { backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <span className="text-lg font-bold capitalize">{p}</span>
                <span className="text-sm text-muted-foreground">{p === 'starter' ? '$29/mo' : p === 'professional' ? '$79/mo' : p === 'business' ? '$149/mo' : 'Custom'}</span>
              </Button>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
            <Button type="button" onClick={handleNext}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 4: Branding */}
      {step === 4 && (
        <div className="space-y-4">
          <Label>Primary Color</Label>
          <div className="flex items-center gap-4">
            <input type="color" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="w-12 h-12 rounded-lg border" style={{ borderColor: theme.border }} />
            <Input value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} />
          </div>
          <Label>Accent Color</Label>
          <div className="flex items-center gap-4">
            <input type="color" value={formData.accentColor} onChange={e => setFormData({...formData, accentColor: e.target.value})} className="w-12 h-12 rounded-lg border" style={{ borderColor: theme.border }} />
            <Input value={formData.accentColor} onChange={e => setFormData({...formData, accentColor: e.target.value})} />
          </div>
          <Label>Background Color</Label>
          <div className="flex items-center gap-4">
            <input type="color" value={formData.backgroundColor} onChange={e => setFormData({...formData, backgroundColor: e.target.value})} className="w-12 h-12 rounded-lg border" style={{ borderColor: theme.border }} />
            <Input value={formData.backgroundColor} onChange={e => setFormData({...formData, backgroundColor: e.target.value})} />
          </div>
          <div className="flex justify-between gap-2 pt-4 border-t" style={{ borderColor: theme.border }}>
            <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
            <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: primaryColor }}>
              {isSubmitting ? 'Creating...' : 'Create Gym'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

import { Check } from 'lucide-react'