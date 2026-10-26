import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, matchLocale, LOCALE_COOKIE } from "@/lib/i18n-config";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first, section] = pathname.split("/");

  // Add a locale prefix: remembered choice first, then the browser language.
  if (!hasLocale(first ?? "")) {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value ?? "";
    const locale = hasLocale(remembered)
      ? remembered
      : matchLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Remember the language the visitor is reading in, for their next visit to "/".
  const res = NextResponse.next();
  if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
    res.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }

  // Fast gate for signed-in areas; pages still check the user and role against the database.
  if (section === "account" || section === "admin") {
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session || (section === "admin" && session.role !== "ADMIN")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}/login`;
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }
  return res;
}

export const config = {
  // Skip Next internals, API routes and files with an extension (images, robots.txt, …).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
