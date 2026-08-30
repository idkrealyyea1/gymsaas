import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function DELETE(
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

    // Soft delete - mark as inactive and deleted
    await prisma.gym.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    })

    await createAuditLog({
      gymId: id,
      action: AUDIT_ACTIONS.GYM_DELETED,
      targetType: 'Gym',
      targetId: id,
      metadata: { name: gym.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gym:', error)
    return NextResponse.json({ error: 'Failed to delete gym' }, { status: 500 })
  }
}