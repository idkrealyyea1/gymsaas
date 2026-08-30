import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.user.findFirst()
    return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', timestamp: new Date().toISOString() }, { status: 500 })
  }
}