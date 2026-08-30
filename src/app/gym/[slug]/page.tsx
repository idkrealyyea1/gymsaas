import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PublicGymPageClient } from './public-gym-client'

export const dynamic = 'force-dynamic'

interface PublicGymPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PublicGymPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.publicGymPage.findUnique({
    where: { slug, isPublished: true },
    include: { gym: { include: { branding: true } } },
  })

  if (!page) {
    return { title: 'Gym Not Found' }
  }

  return {
    title: page.seoTitle || `${page.gym.name} - Fitness Center`,
    description: page.seoDescription || page.gym.description || 'Welcome to our gym',
    openGraph: {
      title: page.seoTitle || page.gym.name,
      description: page.seoDescription || page.gym.description,
      images: page.heroImageUrl ? [page.heroImageUrl] : [],
    },
  }
}

export default async function PublicGymPage({ params }: PublicGymPageProps) {
  const { slug } = await params

  const page = await prisma.publicGymPage.findUnique({
    where: { slug, isPublished: true },
    include: {
      gym: {
        include: {
          branding: true,
          classes: { where: { isActive: true }, include: { schedules: { where: { isActive: true } } } },
          trainers: { where: { isActive: true } },
          membershipPlans: { where: { isActive: true } },
        },
      },
    },
  })

  if (!page) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Gym not found</div>
  }

  return <PublicGymPageClient page={page} />
}