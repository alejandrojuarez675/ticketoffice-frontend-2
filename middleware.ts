import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { FEATURES } from './src/config/featureFlags';

const PUBLIC_PREFIXES = ['/', '/events', '/checkout', '/tickets', '/auth'];

const DISABLED_BY_FLAG = [
  { flag: !FEATURES.PROFILE, path: '/admin/profile' },
  { flag: !FEATURES.REPORTS, path: '/admin/reports' },
  { flag: !FEATURES.USERS, path: '/admin/users' },
  { flag: !FEATURES.SETTINGS, path: '/admin/settings' },
  { flag: !FEATURES.COUPONS, path: '/admin/coupons' },
  // Si deseas ocultar el validador global y usar sólo el de cada evento:
  // { flag: true, path: '/admin/validate' },
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const role = req.cookies.get('role')?.value as 'admin' | 'seller' | 'user' | undefined;

  // Permitir assets internos
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\\.(.*)$/)) {
    return NextResponse.next();
  }

  // Bloquear rutas deshabilitadas por flags
  for (const rule of DISABLED_BY_FLAG) {
    if (rule.flag && (pathname === rule.path || pathname.startsWith(rule.path + '/'))) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Backoffice: permitir admin y seller
  if (pathname.startsWith('/admin')) {
    if (!['admin', 'seller'].includes(role ?? '')) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Público permitido en MVP
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