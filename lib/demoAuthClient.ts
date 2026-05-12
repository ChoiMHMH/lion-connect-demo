"use client";

import { clearDemoAuthCookies, setDemoAuthCookies } from "@/actions/demoAuth";
import {
  DEMO_AUTH_PROFILES,
  getDemoAuthProfile,
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

export async function clearDemoAuthState() {
  await clearDemoAuthCookies();

  const store = useAuthStore.getState();
  store.clearAuth();
  store.setInitialized(true);
}
