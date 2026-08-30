import prisma from './prisma'
import { NotificationType } from '@prisma/client'

interface CreateNotificationInput {
  gymId: string
  memberId?: string
  userId?: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      gymId: input.gymId,
      memberId: input.memberId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
    },
  })
}

export async function createNotificationsForUsers(
  gymId: string,
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      gymId,
      userId,
      type,
      title,
      message,
      data,
    })),
  })
}

export async function createNotificationForAllStaff(
  gymId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  const staff = await prisma.user.findMany({
    where: {
      gymId,
      role: { not: 'MEMBER' },
      isActive: true,
    },
    select: { id: true },
  })

  if (staff.length > 0) {
    await createNotificationsForUsers(gymId, staff.map((s) => s.id), type, title, message, data)
  }
}

export async function getNotifications(
  gymId: string,
  options: {
    userId?: string
    memberId?: string
    isRead?: boolean
    type?: NotificationType
    page?: number
    limit?: number
  } = {}
) {
  const { userId, memberId, isRead, type, page = 1, limit = 20 } = options

  const where: any = { gymId }
  if (userId) where.userId = userId
  if (memberId) where.memberId = memberId
  if (isRead !== undefined) where.isRead = isRead
  if (type) where.type = type

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { gymId, isRead: false, ...(userId ? { userId } : {}), ...(memberId ? { memberId } : {}) } }),
  ])

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  })
}

export async function markAllNotificationsAsRead(gymId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { gymId, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
}

export async function deleteNotification(notificationId: string, gymId: string): Promise<void> {
  await prisma.notification.delete({
    where: { id: notificationId, gymId },
  })
}

export const NOTIFICATION_TEMPLATES = {
  MEMBERSHIP_EXPIRING: (memberName: string, days: number) => ({
    type: 'MEMBERSHIP_EXPIRING' as NotificationType,
    title: 'Membership Expiring Soon',
    message: `${memberName}'s membership expires in ${days} day${days !== 1 ? 's' : ''}.`,
  }),
  MEMBERSHIP_EXPIRED: (memberName: string) => ({
    type: 'MEMBERSHIP_EXPIRED' as NotificationType,
    title: 'Membership Expired',
    message: `${memberName}'s membership has expired.`,
  }),
  PAYMENT_RECEIVED: (memberName: string, amount: number, currency: string) => ({
    type: 'PAYMENT_RECEIVED' as NotificationType,
    title: 'Payment Received',
    message: `Payment of ${currency} ${amount.toFixed(2)} received from ${memberName}.`,
  }),
  PAYMENT_OVERDUE: (memberName: string, amount: number, currency: string) => ({
    type: 'PAYMENT_OVERDUE' as NotificationType,
    title: 'Payment Overdue',
    message: `${memberName} has an overdue payment of ${currency} ${amount.toFixed(2)}.`,
  }),
  NEW_MEMBER: (memberName: string) => ({
    type: 'NEW_MEMBER' as NotificationType,
    title: 'New Member',
    message: `Welcome ${memberName} to the gym!`,
  }),
  NEW_BOOKING: (className: string, memberName: string) => ({
    type: 'NEW_BOOKING' as NotificationType,
    title: 'New Class Booking',
    message: `${memberName} booked ${className}.`,
  }),
  CLASS_CANCELLED: (className: string) => ({
    type: 'CLASS_CANCELLED' as NotificationType,
    title: 'Class Cancelled',
    message: `${className} has been cancelled.`,
  }),
  TRIAL_ENDING: (memberName: string, days: number) => ({
    type: 'TRIAL_ENDING' as NotificationType,
    title: 'Trial Ending Soon',
    message: `${memberName}'s trial ends in ${days} day${days !== 1 ? 's' : ''}.`,
  }),
  MAINTENANCE_REMINDER: (equipmentName: string) => ({
    type: 'MAINTENANCE_REMINDER' as NotificationType,
    title: 'Maintenance Due',
    message: `Maintenance is due for ${equipmentName}.`,
  }),
  CLASS_REMINDER: (className: string, time: string) => ({
    type: 'CLASS_REMINDER' as NotificationType,
    title: 'Class Starting Soon',
    message: `${className} starts at ${time}.`,
  }),
}