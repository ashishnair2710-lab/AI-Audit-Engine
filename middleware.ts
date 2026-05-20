import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return NextResponse.next()
  const session = request.cookies.get('crm_session')
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
