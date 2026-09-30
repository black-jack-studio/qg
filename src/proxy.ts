import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessCode, accessToken } from "@/lib/access";

export async function proxy(request: NextRequest) {
  const code = accessCode();
  // Sans code configuré (dev local), l'app reste ouverte.
  if (!code) return NextResponse.next();

  const cookie = request.cookies.get(ACCESS_COOKIE)?.value;
  if (cookie && cookie === (await accessToken(code))) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/entree";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!entree|robots.txt|_next/|favicon.ico|icon|apple-icon).*)"],
};
