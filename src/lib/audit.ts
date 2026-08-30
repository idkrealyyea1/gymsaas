import prisma from './prisma'
import { AuditAction } from '@prisma/client'

interface AuditLogInput {
  gymId?: string
  userId?: string
  action: AuditAction
  targetType?: string
  targetId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        gymId: input.gymId,
        userId: input.userId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(
  gymId: string,
  options: {
    userId?: string
    action?: AuditAction
    targetType?: string
    targetId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  } = {}
) {
  const {
    userId,
    action,
    targetType,
    targetId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = options

  const where: any = { gymId }

  if (userId) where.userId = userId
  if (action) where.action = action
  if (targetType) where.targetType = targetType
  if (targetId) where.targetId = targetId
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN' as AuditAction,
  LOGOUT: 'LOGOUT' as AuditAction,
  MEMBER_CREATED: 'MEMBER_CREATED' as AuditAction,
  MEMBER_UPDATED: 'MEMBER_UPDATED' as AuditAction,
  MEMBER_DELETED: 'MEMBER_DELETED' as AuditAction,
  PAYMENT_CREATED: 'PAYMENT_CREATED' as AuditAction,
  PAYMENT_UPDATED: 'PAYMENT_UPDATED' as AuditAction,
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED' as AuditAction,
  MEMBERSHIP_CHANGED: 'MEMBERSHIP_CHANGED' as AuditAction,
  STAFF_ADDED: 'STAFF_ADDED' as AuditAction,
  STAFF_PERMISSION_CHANGED: 'STAFF_PERMISSION_CHANGED' as AuditAction,
  SETTINGS_CHANGED: 'SETTINGS_CHANGED' as AuditAction,
  BRANDING_CHANGED: 'BRANDING_CHANGED' as AuditAction,
  SUBSCRIPTION_CHANGED: 'SUBSCRIPTION_CHANGED' as AuditAction,
  GYM_SUSPENDED: 'GYM_SUSPENDED' as AuditAction,
  GYM_ACTIVATED: 'GYM_ACTIVATED' as AuditAction,
  GYM_DELETED: 'GYM_DELETED' as AuditAction,
}