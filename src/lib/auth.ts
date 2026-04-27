import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { getJwtSecret } from "@/lib/env";

const USER_SESSION_COOKIE = "ielts_prep_session";
const ADMIN_SESSION_COOKIE = "ielts_prep_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  return new TextEncoder().encode(getJwtSecret());
}

export interface UserSessionPayload {
  kind: "user";
  sub: string;
  phone: string;
  exp: number;
  iat: number;
}

export interface AdminSessionPayload {
  kind: "admin";
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

type SessionPayload = UserSessionPayload | AdminSessionPayload;

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

async function signToken(payload: {
  kind: "user" | "admin";
  sub: string;
  phone?: string;
  email?: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function createUserSessionToken(userId: string, phone: string) {
  return signToken({
    kind: "user",
    sub: userId,
    phone,
  });
}

export async function createAdminSessionToken(email: string) {
  return signToken({
    kind: "admin",
    sub: email,
    email,
  });
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (
      payload.kind === "user" &&
      typeof payload.sub === "string" &&
      typeof payload.phone === "string"
    ) {
      return {
        kind: "user",
        sub: payload.sub,
        phone: payload.phone,
        exp: Number(payload.exp ?? 0),
        iat: Number(payload.iat ?? 0),
      };
    }

    if (
      payload.kind === "admin" &&
      typeof payload.sub === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        kind: "admin",
        sub: payload.sub,
        email: payload.email,
        exp: Number(payload.exp ?? 0),
        iat: Number(payload.iat ?? 0),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function setUserSessionCookie(token: string) {
  const store = await cookies();
  store.set(USER_SESSION_COOKIE, token, getCookieOptions());
}

export async function clearUserSessionCookie() {
  const store = await cookies();
  store.set(USER_SESSION_COOKIE, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}

export async function setAdminSessionCookie(token: string) {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, getCookieOptions());
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}

export async function getUserSession() {
  const store = await cookies();
  const token = store.get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  return payload?.kind === "user" ? payload : null;
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  return payload?.kind === "admin" ? payload : null;
}
