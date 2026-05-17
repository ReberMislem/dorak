import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, securityHeadersMiddleware } from "./middleware/index";

export async function proxy(req: NextRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  const response = NextResponse.next();
  return securityHeadersMiddleware(req, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|icons/|images/|manifest.json|sw.js).*)",
  ],
};
