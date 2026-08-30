import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const context = await requireTenantContext()
    const body = await request.json()
    const { attendanceId } = body

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })
    }

    // Find the attendance record
    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        gymId: context.gymId,
        status: 'CHECKED_IN',
      },
      include: { member: true },
    })

    if (!attendance) {
      return NextResponse.json({ error: 'Active attendance record not found' }, { status: 404 })
    }

    // Update attendance record
    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOutAt: new Date(),
        status: 'CHECKED_OUT',
      },
    })

    // Audit log
    await createAuditLog({
      gymId: context.gymId,
      userId: context.userId,
      action: AUDIT_ACTIONS.MEMBER_UPDATED,
      targetType: 'Attendance',
      targetId: attendanceId,
      metadata: { memberId: attendance.memberId, type: 'checkout' },
    })

    return NextResponse.json({ 
      attendance: updated,
      member: {
        id: attendance.member.id,
        firstName: attendance.member.firstName,
        lastName: attendance.member.lastName,
        memberId: attendance.member.memberId,
      }
    })
  } catch (error) {
    console.error('Check-out error:', error)
    return NextResponse.json({ error: 'Failed to check out' }, { status: 500 })
  }
}