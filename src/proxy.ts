import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth.config";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (role !== "STAFF" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return;
  }

  if (pathname.startsWith("/dashboard") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
