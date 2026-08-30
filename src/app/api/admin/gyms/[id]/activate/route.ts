import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin()
    const { id } = await params

    const gym = await prisma.gym.findUnique({ where: { id } })
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    await prisma.gym.update({
      where: { id },
      data: { isSuspended: false, suspendedAt: null, suspendedReason: null },
    })

    await createAuditLog({
      gymId: id,
      action: AUDIT_ACTIONS.GYM_ACTIVATED,
      targetType: 'Gym',
      targetId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error activating gym:', error)
    return NextResponse.json({ error: 'Failed to activate gym' }, { status: 500 })
  }
}