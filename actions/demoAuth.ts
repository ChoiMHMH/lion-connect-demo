"use server";

import { cookies } from "next/headers";
import { DEMO_AUTH_COOKIE, getDemoAuthProfile, type DemoRole } from "@/constants/demoAuth";

const USER_ROLES_COOKIE = "user-roles";
const DEMO_AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function demoCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEMO_AUTH_COOKIE_MAX_AGE,
  };
}

export async function setDemoAuthCookies(role: DemoRole) {
  const profile = getDemoAuthProfile(role);

  if (!profile) {
    throw new Error(`Unknown demo role: ${role}`);
  }

  const cookieStore = await cookies();
  const options = demoCookieOptions();

  cookieStore.set(DEMO_AUTH_COOKIE, role, options);
  cookieStore.set(USER_ROLES_COOKIE, JSON.stringify(profile.roles), options);
}

export async function clearDemoAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(DEMO_AUTH_COOKIE);
  cookieStore.delete(USER_ROLES_COOKIE);
}
