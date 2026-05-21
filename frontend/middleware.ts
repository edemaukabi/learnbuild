import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED: Record<string, string[]> = {
  '/dashboard': ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
  '/learn': ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
  '/instructor': ['INSTRUCTOR', 'ADMIN'],
  '/admin': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiredRoles = Object.entries(PROTECTED).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1];

  if (!requiredRoles) return NextResponse.next();

  const accessToken = request.cookies.get('access_token');
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
