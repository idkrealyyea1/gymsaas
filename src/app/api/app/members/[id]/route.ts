import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { generateMemberId } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenantContext()
    const { id } = await params

    const member = await prisma.member.findFirst({
      where: { id, gymId: context.gymId },
      include: {
        memberships: {
          include: { plan: true },
          orderBy: { startDate: 'desc' },
        },
        payments: { orderBy: { paidAt: 'desc' }, take: 10 },
        attendance: { orderBy: { checkInAt: 'desc' }, take: 10 },
        measurements: { orderBy: { recordedAt: 'desc' }, take: 10 },
        workoutPlans: { include: { exercises: { include: { exercise: true } } }, take: 5 },
        classBookings: { include: { schedule: { include: { class: true } } }, take: 10 },
        leads: { take: 5 },
        trainerMembers: { include: { trainer: true } },
        notifications: { where: { isRead: false }, take: 5 },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenantContext()
    const { id } = await params
    const body = await request.json()

    const member = await prisma.member.findFirst({
      where: { id, gymId: context.gymId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        address: body.address,
        city: body.city,
        country: body.country,
        postalCode: body.postalCode,
        emergencyContact: body.emergencyContact,
        notes: body.notes,
      },
    })

    await createAuditLog({
      gymId: context.gymId,
      userId: context.userId,
      action: AUDIT_ACTIONS.MEMBER_UPDATED,
      targetType: 'Member',
      targetId: id,
      metadata: { changes: body },
    })

    return NextResponse.json({ member: updated })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenantContext()
    const { id } = await params

    const member = await prisma.member.findFirst({
      where: { id, gymId: context.gymId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.member.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    })

    await createAuditLog({
      gymId: context.gymId,
      userId: context.userId,
      action: AUDIT_ACTIONS.MEMBER_DELETED,
      targetType: 'Member',
      targetId: id,
      metadata: { memberId: member.memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}