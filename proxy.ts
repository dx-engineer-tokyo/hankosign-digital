import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip API routes, Next.js internals, static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Auth check for dashboard routes
  if (pathname.includes('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Not authenticated - redirect to login
      const segments = pathname.split('/');
      const locale = routing.locales.includes(segments[1] as any)
        ? segments[1]
        : routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin-only routes
    if (pathname.includes('/dashboard/roles')) {
      const userRole = token.role as string;
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        // Not authorized - redirect to main dashboard
        const segments = pathname.split('/');
        const locale = routing.locales.includes(segments[1] as any)
          ? segments[1]
          : routing.defaultLocale;
        const dashboardUrl = new URL(`/${locale}/dashboard`, req.nextUrl.origin);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
