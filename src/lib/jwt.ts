// ============================================
// دورك - JWT Authentication Utilities
// ============================================

import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload, AuthUser } from "@/types";
import { cookies } from "next/headers";
import { TOKEN_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/constants";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ---- Generate Tokens ----
export function generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  };
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export function generateRefreshToken(userId: string): string {
  const signOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  };
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, signOptions);
}

// ---- Verify Tokens ----
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as { userId: string };
  } catch {
    return null;
  }
}

// ---- Cookie Helpers (Server Components) ----
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  // Method 1: standard delete
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);

  // Method 2: Force overwrite with expired date (Double security)
  cookieStore.set(TOKEN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    expires: new Date(0),
    httpOnly: true,
  });
  cookieStore.set(REFRESH_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    expires: new Date(0),
    httpOnly: true,
  });
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value ?? null;
}

// ---- Get Current User from Request ----
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    name: "",
    email: payload.email,
    role: payload.role,
    shopId: payload.shopId,
    accountStatus: payload.accountStatus,
  };
}
