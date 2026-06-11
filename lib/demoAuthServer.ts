import { cookies } from "next/headers";
import {
  DEMO_AUTH_COOKIE,
  DEMO_ONLY_MODE,
  getDemoAuthProfile,
  type DemoRole,
} from "@/constants/demoAuth";

type InitialDemoRoleOptions = {
  preferFallbackInDemoOnly?: boolean;
};

export async function getInitialDemoRole(
  fallbackRole: DemoRole | null = null,
  options: InitialDemoRoleOptions = {}
): Promise<DemoRole | null> {
  if (DEMO_ONLY_MODE && options.preferFallbackInDemoOnly && fallbackRole) {
    return fallbackRole;
  }

  const cookieStore = await cookies();
  const demoRole = cookieStore.get(DEMO_AUTH_COOKIE)?.value;

  return getDemoAuthProfile(demoRole)?.role ?? (DEMO_ONLY_MODE ? fallbackRole : null);
}
