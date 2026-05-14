import { cookies } from "next/headers";
import {
  DEMO_AUTH_COOKIE,
  DEMO_ONLY_MODE,
  getDemoAuthProfile,
  type DemoRole,
} from "@/constants/demoAuth";

export async function getInitialDemoRole(
  fallbackRole: DemoRole | null = null
): Promise<DemoRole | null> {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get(DEMO_AUTH_COOKIE)?.value;

  return getDemoAuthProfile(demoRole)?.role ?? (DEMO_ONLY_MODE ? fallbackRole : null);
}
