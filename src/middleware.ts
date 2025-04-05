import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get stored auth data from cookies
  const isAuthenticated = request.cookies.has('authenticated');
  
  // Allow access to login page always
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // Protect authenticated routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tasks/:path*',
    '/calendar/:path*',
    '/data-library/:path*',
    '/reports/:path*',
    '/documentation/:path*',
    '/settings/:path*',
    '/help/:path*',
    '/search/:path*',
    '/analytics/:path*',
    '/users/:path*',
    '/login'
  ],
}; 