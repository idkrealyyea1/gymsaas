import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        gymSlug: { label: 'Gym Slug', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            gym: true,
            staff: { include: { role: true } },
            trainer: true,
            member: true,
          },
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account is temporarily locked')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValid) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
              lockedUntil: user.failedLoginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
          })
          throw new Error('Invalid credentials')
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        })

        if (user.role === UserRole.SUPER_ADMIN) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            gymId: null,
          }
        }

        if (!user.gymId || !user.gym?.isActive || user.gym?.isSuspended) {
          throw new Error('Gym is not active or suspended')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          gymId: user.gymId,
          branchId: user.branchId ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.gymId = (user as any).gymId
        token.branchId = (user as any).branchId
      }
      if (trigger === 'update' && session) {
        token.name = session.name
        token.image = session.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.gymId = token.gymId as string | null
        session.user.branchId = token.branchId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface User {
    role: UserRole
    gymId: string | null
    branchId: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      gymId: string | null
      branchId: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    gymId: string | null
    branchId: string | null
  }
}