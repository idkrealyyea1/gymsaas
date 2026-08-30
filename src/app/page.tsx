import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    if (session.user.role === UserRole.SUPER_ADMIN) {
      redirect('/admin')
    }
    if (session.user.gymId) {
      redirect('/app/dashboard')
    }
    if (session.user.role === UserRole.MEMBER) {
      redirect('/member/dashboard')
    }
  }

  redirect('/auth/login')
}