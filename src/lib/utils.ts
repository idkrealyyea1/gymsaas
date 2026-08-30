import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateMemberId(gymId: string, number: number): string {
  return `GYM-${number.toString().padStart(6, '0')}`
}

export function calculateBMI(weight: number, height: number): number {
  if (height <= 0) return 0
  const heightInMeters = height / 100
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
}

export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date()
  const birth = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function daysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isExpired(date: Date | string): boolean {
  return daysUntil(date) < 0
}

export function isExpiringSoon(date: Date | string, days = 7): boolean {
  const remaining = daysUntil(date)
  return remaining >= 0 && remaining <= days
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    inactive: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
    pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    expired: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    frozen: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    cancelled: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
    paid: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    partial: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    overdue: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    scheduled: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    ongoing: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    completed: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
    booked: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    attended: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    no_show: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    waitlist: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    new: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    contacted: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    trial: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    interested: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    converted: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    lost: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    available: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    in_use: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    maintenance: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    retired: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
    trial: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    active: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    past_due: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    suspended: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  }
  return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
    EXPIRED: 'Expired',
    FROZEN: 'Frozen',
    CANCELLED: 'Cancelled',
    PAID: 'Paid',
    PARTIAL: 'Partial',
    OVERDUE: 'Overdue',
    SCHEDULED: 'Scheduled',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    BOOKED: 'Booked',
    ATTENDED: 'Attended',
    NO_SHOW: 'No Show',
    WAITLIST: 'Waitlist',
    NEW: 'New',
    CONTACTED: 'Contacted',
    TRIAL: 'Trial',
    INTERESTED: 'Interested',
    CONVERTED: 'Converted',
    LOST: 'Lost',
    AVAILABLE: 'Available',
    IN_USE: 'In Use',
    MAINTENANCE: 'Maintenance',
    RETIRED: 'Retired',
    TRIAL: 'Trial',
    ACTIVE: 'Active',
    PAST_DUE: 'Past Due',
    SUSPENDED: 'Suspended',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
  }
  return labels[status.toUpperCase()] || status
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateReceiptNumber(prefix = 'RCP'): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}${month}-${random}`
}

export function generateInvoiceNumber(prefix = 'INV', year: number, number: number): string {
  return `${prefix}-${year}-${number.toString().padStart(6, '0')}`
}

export function parseJsonSafe<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}