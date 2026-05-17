// ============================================
// دورك - Middleware Logic
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/constants";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

function decodeBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function verifyAccessToken(token: string): Promise<boolean> {
  const [header, payload, signature] = token.split(".");
  const secret = process.env.JWT_SECRET;

  if (!header || !payload || !signature || !secret) {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature),
      new TextEncoder().encode(`${header}.${payload}`)
    );

    if (!validSignature) {
      return false;
    }

    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    return typeof claims.exp !== "number" || claims.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

  // Add no-cache headers for auth checks
  const responseHeaders = new Headers();
  responseHeaders.set("Cache-Control", "no-store, max-age=0");

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(url);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    const [header, payload, signature] = token.split(".");
    if (!payload) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(TOKEN_COOKIE_NAME);
      return res;
    }
    
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));

    if (!(await verifyAccessToken(token))) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete(TOKEN_COOKIE_NAME);
      res.cookies.delete(REFRESH_COOKIE_NAME);
      return res;
    }

    // Account Status Checks (Skip for SUPER_ADMIN)
    if (claims.role !== "SUPER_ADMIN") {
      if (claims.accountStatus === "PENDING" && !pathname.startsWith("/status/pending")) {
        return NextResponse.redirect(new URL("/status/pending", req.url));
      }
      if (claims.accountStatus === "SUSPENDED" && !pathname.startsWith("/status/suspended")) {
        return NextResponse.redirect(new URL("/status/suspended", req.url));
      }
    }
  }

  if (isAuthRoute && token) {
    if (await verifyAccessToken(token)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return null;
}

export function securityHeadersMiddleware(_req: NextRequest, res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}
