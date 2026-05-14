import { cookies } from "next/headers";
import { DEMO_AUTH_COOKIE, getDemoAuthProfile, type DemoRole } from "@/constants/demoAuth";

export async function getInitialDemoRole(): Promise<DemoRole | null> {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get(DEMO_AUTH_COOKIE)?.value;

  return getDemoAuthProfile(demoRole)?.role ?? null;
}
