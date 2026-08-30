import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { generateMemberId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const body = await request.json()

    // Check if slug exists
    const existingGym = await prisma.gym.findUnique({ where: { slug: body.slug } })
    if (existingGym) {
      return NextResponse.json({ error: 'Gym slug already exists' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.ownerPassword, 12)

    // Create gym
    const gym = await prisma.gym.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        country: body.country,
        timezone: body.timezone || 'UTC',
        currency: body.currency || 'USD',
        isActive: true,
      },
    })

    // Create branding
    await prisma.gymBranding.create({
      data: {
        gymId: gym.id,
        primaryColor: body.primaryColor || '#111827',
        secondaryColor: body.secondaryColor || '#374151',
        accentColor: body.accentColor || '#22C55E',
        backgroundColor: body.backgroundColor || '#0F0F0F',
        surfaceColor: body.surfaceColor || '#1A1A1A',
        textColor: body.textColor || '#FFFFFF',
        sidebarColor: body.sidebarColor || '#111827',
        buttonColor: body.buttonColor || '#22C55E',
        fontFamily: body.fontFamily || 'Inter',
      },
    })

    // Create default settings
    await prisma.gymSettings.create({
      data: {
        gymId: gym.id,
      },
    })

    // Create owner user
    const ownerUser = await prisma.user.create({
      data: {
        email: body.ownerEmail,
        passwordHash,
        name: body.ownerName,
        role: 'GYM_OWNER',
        gymId: gym.id,
        isActive: true,
      },
    })

    // Create default subscription plans
    const plans = [
      { name: 'Monthly', description: 'Month-to-month membership', price: 49, durationDays: 30, accessType: 'unlimited', classesIncluded: true },
      { name: 'Quarterly', description: '3-month membership', price: 135, durationDays: 90, accessType: 'unlimited', classesIncluded: true, discountPercent: 8 },
      { name: '6 Months', description: '6-month membership', price: 240, durationDays: 180, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: true, discountPercent: 18 },
      { name: 'Yearly', description: 'Annual membership', price: 420, durationDays: 365, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: true, discountPercent: 28 },
    ]

    for (const plan of plans) {
      await prisma.membershipPlan.create({
        data: {
          gymId: gym.id,
          ...plan,
          currency: body.currency || 'USD',
          isActive: true,
        },
      })
    }

    // Create default expense categories
    const categories = ['Rent', 'Electricity', 'Water', 'Internet', 'Equipment', 'Maintenance', 'Salaries', 'Marketing', 'Cleaning', 'Supplies', 'Other']
    for (const cat of categories) {
      await prisma.expenseCategory.create({
        data: { gymId: gym.id, name: cat, isActive: true },
      })
    }

    // Create default subscription
    const subscriptionPlan = await prisma.subscriptionPlan.findFirst({ where: { name: body.plan.charAt(0).toUpperCase() + body.plan.slice(1) } })
    if (subscriptionPlan) {
      await prisma.subscription.create({
        data: {
          gymId: gym.id,
          planId: subscriptionPlan.id,
          status: 'TRIAL',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          billingCycle: 'monthly',
          price: subscriptionPlan.priceMonthly,
          currency: 'USD',
        },
      })
    }

    // Create audit log
    await createAuditLog({
      gymId: gym.id,
      userId: ownerUser.id,
      action: AUDIT_ACTIONS.MEMBER_CREATED,
      targetType: 'Gym',
      targetId: gym.id,
      metadata: { name: gym.name, slug: gym.slug },
    })

    return NextResponse.json({ gym: { ...gym, owner: ownerUser } })
  } catch (error) {
    console.error('Error creating gym:', error)
    return NextResponse.json({ error: 'Failed to create gym' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) {
      switch (status) {
        case 'active': where.isActive = true; where.isSuspended = false; break
        case 'suspended': where.isSuspended = true; break
        case 'trial': where.trialEndsAt = { gte: new Date() }; break
        case 'expired': where.isActive = false; break
      }
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { members: true, users: true } },
          branding: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gym.count({ where }),
    ])

    return NextResponse.json({
      gyms,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}