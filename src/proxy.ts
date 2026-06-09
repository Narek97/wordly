import { NextResponse, type NextRequest } from "next/server"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const ROOT_DOMAIN = new URL(APP_URL).host

const ALLOWED_HOSTS = new Set([ROOT_DOMAIN, `www.${ROOT_DOMAIN}`, `admin.${ROOT_DOMAIN}`])

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? ""

  if (!ALLOWED_HOSTS.has(hostname)) {
    return NextResponse.redirect(new URL("/", APP_URL))
  }

  if (hostname.startsWith("admin.")) {
    const url = request.nextUrl.clone()
    const path = url.pathname === "/" ? "" : url.pathname
    url.pathname = `/admin${path}`
    return NextResponse.rewrite(url)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
