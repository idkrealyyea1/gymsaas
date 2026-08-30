import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireTenantContext } from '@/lib/tenant'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const context = await requireTenantContext()
    
    const branding = await prisma.gymBranding.findUnique({
      where: { gymId: context.gymId! },
    })

    return NextResponse.json({ branding })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}