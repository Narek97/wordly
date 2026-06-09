import { NextResponse } from "next/server"
// eslint-disable-next-line no-duplicate-imports
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? ""
  const isAdminSubdomain = hostname.startsWith("admin.") || hostname.startsWith("admin-")

  if (isAdminSubdomain) {
    const url = request.nextUrl.clone()
    const path = url.pathname === "/" ? "" : url.pathname
    url.pathname = `/admin${path}`
    return NextResponse.rewrite(url)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
