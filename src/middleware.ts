import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Super admin routes
    if (path.startsWith('/admin')) {
      if (token?.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/auth/login?error=unauthorized', req.url))
      }
      return NextResponse.next()
    }

    // Gym admin routes - require gym context
    if (path.startsWith('/app') || path.startsWith('/api/app')) {
      if (!token?.gymId) {
        return NextResponse.redirect(new URL('/auth/login?error=no-gym', req.url))
      }
      
      // Check if gym is suspended
      // This would require a DB call, so we'll handle it in the API routes
      return NextResponse.next()
    }

    // Member portal routes
    if (path.startsWith('/member') || path.startsWith('/api/member')) {
      if (token?.role !== 'MEMBER' && token?.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/auth/login?error=unauthorized', req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Public routes that don't require auth
        if (
          path === '/' ||
          path.startsWith('/auth') ||
          path.startsWith('/gym/') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/api/health') ||
          path.startsWith('/api/public') ||
          path.startsWith('/_next') ||
          path.startsWith('/favicon') ||
          path.startsWith('/images') ||
          path === '/robots.txt' ||
          path === '/sitemap.xml'
        ) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
}