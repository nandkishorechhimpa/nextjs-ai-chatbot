import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware - Pathname:", pathname);
  console.log("Middleware - Hostname:", request.headers.get("host"));


  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  // if (pathname.startsWith("/ping")) {
  //   return new Response("pong", { status: 200 });
  // }

  // if (pathname.startsWith("/api/auth")) {
  //   return NextResponse.next();
  // }

  // const token = await getToken({
  //   req: request,
  //   secret: process.env.AUTH_SECRET,
  //   secureCookie: !isDevelopmentEnvironment,
  // });

  // if (!token) {
  //   const redirectUrl = encodeURIComponent(request.url);

  //   return NextResponse.redirect(
  //     new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
  //   );
  // }

  // const isGuest = guestRegex.test(token?.email ?? "");

  // if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // Logged-in users can access everything else
  return NextResponse.next();
}

export const config = {
  matcher: [

    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",
    // Match all routes except static and public assets
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

