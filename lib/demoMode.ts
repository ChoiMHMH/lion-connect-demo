import { DEMO_ACCESS_TOKEN_PREFIX, DEMO_ONLY_MODE, getDemoRoleByUser } from "@/constants/demoAuth";
import type { User } from "@/store/authStore";

export function isDemoOnlyMode() {
  return DEMO_ONLY_MODE;
}

export function isDemoAccessToken(accessToken: string | null | undefined) {
  return Boolean(accessToken?.startsWith(DEMO_ACCESS_TOKEN_PREFIX));
}

export function isDemoAuthState({
  accessToken,
  user,
}: {
  accessToken: string | null | undefined;
  user: User | null | undefined;
}) {
  return DEMO_ONLY_MODE || isDemoAccessToken(accessToken) || Boolean(getDemoRoleByUser(user));
}
