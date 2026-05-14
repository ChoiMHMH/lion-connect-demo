"use client";

import { clearDemoAuthCookies, setDemoAuthCookies } from "@/actions/demoAuth";
import {
  DEFAULT_DEMO_ROLE,
  DEMO_AUTH_PROFILES,
  DEMO_ONLY_MODE,
  getDemoAuthProfile,
  getDemoRoleByUser,
  type DemoAuthProfile,
  type DemoRole,
} from "@/constants/demoAuth";
import { useAuthStore } from "@/store/authStore";

function applyDemoAuth(profile: DemoAuthProfile) {
  const store = useAuthStore.getState();

  store.setAuth(profile.accessToken, profile.user);
  store.setInitialized(true);

  return profile;
}

export async function activateDemoAuth(role: DemoRole) {
  const profile = getDemoAuthProfile(role);

  if (!profile) {
    throw new Error(`Unknown demo role: ${role}`);
  }

  await setDemoAuthCookies(role);
  return applyDemoAuth(profile);
}

export function restoreDemoAuth(role: DemoRole) {
  return applyDemoAuth(DEMO_AUTH_PROFILES[role]);
}

export async function ensureDefaultDemoAuth() {
  const store = useAuthStore.getState();
  const role = getDemoRoleByUser(store.user) ?? DEFAULT_DEMO_ROLE;
  const profile = DEMO_AUTH_PROFILES[role];

  await setDemoAuthCookies(role);
  return applyDemoAuth(profile);
}

export async function clearDemoAuthState() {
  await clearDemoAuthCookies();

  const store = useAuthStore.getState();
  store.clearAuth();

  if (DEMO_ONLY_MODE) {
    await setDemoAuthCookies(DEFAULT_DEMO_ROLE);
    return applyDemoAuth(DEMO_AUTH_PROFILES[DEFAULT_DEMO_ROLE]);
  }

  store.setInitialized(true);
}
