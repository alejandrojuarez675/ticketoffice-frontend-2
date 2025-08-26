import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple RBAC middleware: block /admin and /organizer for non-admins in MVP.
// Role is read from cookie "role" with values: admin | organizer | user | undefined
// Public allowlist for MVP: home, marketing, sellers apply, events, vip, checkout, congrats, tickets, contact, validate.

const PUBLIC_PREFIXES = [
  '/',
  '/events',
  '/checkout',
  '/tickets',
  '/contact',
  '/sellers/apply',
  '/validate',
  '/auth',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get('role')?.value as 'admin' | 'organizer' | 'user' | undefined;

  // Allow static files and Next internal
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(.*)$/)) {
    return NextResponse.next();
  }

  // Admin/Organizer sections require admin during MVP (organizer disabled for now)
  if (pathname.startsWith('/admin') || pathname.startsWith('/organizer')) {
    if (role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Public allowlist: if path doesn't start with any allowed prefix, restrict to admin
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isPublic && role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
