import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { createNotification, NOTIFICATION_TEMPLATES } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const context = await requireTenantContext()
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Get member with active membership
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId: context.gymId, isActive: true },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if member has active membership
    const activeMembership = member.memberships[0]
    const gymSettings = await prisma.gymSettings.findUnique({ where: { gymId: context.gymId } })

    if (gymSettings?.checkInRequiresActiveMembership && !activeMembership) {
      return NextResponse.json({ 
        error: 'Member does not have an active membership',
        membershipStatus: 'NO_ACTIVE_MEMBERSHIP'
      }, { status: 400 })
    }

    if (activeMembership) {
      const now = new Date()
      const endDate = new Date(activeMembership.endDate)
      
      if (activeMembership.status === 'FROZEN') {
        return NextResponse.json({ 
          error: 'Membership is frozen',
          membershipStatus: 'FROZEN'
        }, { status: 400 })
      }

      if (endDate < now) {
        return NextResponse.json({ 
          error: 'Membership has expired',
          membershipStatus: 'EXPIRED'
        }, { status: 400 })
      }

      // Check if within grace period
      const graceDays = gymSettings?.gracePeriodDays || 3
      const graceEndDate = new Date(endDate.getTime() + graceDays * 24 * 60 * 60 * 1000)
      if (now > graceEndDate) {
        return NextResponse.json({ 
          error: 'Membership expired (grace period ended)',
          membershipStatus: 'EXPIRED'
        }, { status: 400 })
      }
    }

    // Check if already checked in today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        gymId: context.gymId,
        memberId,
        checkInAt: { gte: todayStart, lte: todayEnd },
        status: 'CHECKED_IN',
      },
    })

    if (existingAttendance) {
      return NextResponse.json({ 
        error: 'Member already checked in today',
        attendance: existingAttendance
      }, { status: 400 })
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        gymId: context.gymId!,
        memberId,
        checkInAt: new Date(),
        status: 'CHECKED_IN',
        source: 'manual',
      },
    })

    // Create notification for staff
    await createNotification({
      gymId: context.gymId!,
      type: 'NEW_MEMBER',
      title: 'Member Checked In',
      message: `${member.firstName} ${member.lastName} checked in`,
      data: { memberId: member.id, attendanceId: attendance.id },
    })

    // Audit log
    await createAuditLog({
      gymId: context.gymId,
      userId: context.userId,
      action: AUDIT_ACTIONS.MEMBER_UPDATED,
      targetType: 'Attendance',
      targetId: attendance.id,
      metadata: { memberId, type: 'checkin' },
    })

    return NextResponse.json({ 
      attendance,
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        memberId: member.memberId,
        membership: activeMembership ? {
          planName: activeMembership.plan?.name,
          endDate: activeMembership.endDate,
        } : null,
      }
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
  }
}