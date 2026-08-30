import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { generateMemberId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const context = await requireTenantContext()
    const body = await request.json()

    // Get the next member number
    const lastMember = await prisma.member.findFirst({
      where: { gymId: context.gymId },
      orderBy: { createdAt: 'desc' },
      select: { memberId: true },
    })

    let nextNumber = 1
    if (lastMember?.memberId) {
      const match = lastMember.memberId.match(/GYM-(\d+)/)
      if (match) nextNumber = parseInt(match[1]) + 1
    }

    const memberId = generateMemberId(context.gymId!, nextNumber)

    // Generate QR code data
    const qrData = JSON.stringify({ memberId, gymId: context.gymId })

    const member = await prisma.member.create({
      data: {
        gymId: context.gymId!,
        memberId,
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
        qrCode: qrData,
        notes: body.notes,
        status: 'PENDING',
        source: body.source,
      },
    })

    await createAuditLog({
      gymId: context.gymId,
      userId: context.userId,
      action: AUDIT_ACTIONS.MEMBER_CREATED,
      targetType: 'Member',
      targetId: member.id,
      metadata: { memberId: member.memberId },
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const context = await requireTenantContext()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = { gymId: context.gymId, isActive: true }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) where.status = status

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          memberships: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1,
          },
          _count: { select: { attendance: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.member.count({ where }),
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}