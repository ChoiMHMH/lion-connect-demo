import { describe, expect, it } from "vitest";
import { DEMO_AUTH_PROFILES } from "@/constants/demoAuth";
import { isDemoAccessToken, isDemoAuthState, isDemoOnlyMode } from "@/lib/demoMode";

describe("demoMode", () => {
  it("demo accessToken prefix를 감지한다", () => {
    expect(isDemoAccessToken("demo-access-token-talent")).toBe(true);
    expect(isDemoAccessToken("real-token")).toBe(false);
    expect(isDemoAccessToken(null)).toBe(false);
  });

  it("demo user 또는 demo accessToken이 있으면 demo auth state로 본다", () => {
    expect(isDemoOnlyMode()).toBe(true);
    expect(
      isDemoAuthState({
        accessToken: null,
        user: DEMO_AUTH_PROFILES.demo_company.user,
      })
    ).toBe(true);
    expect(isDemoAuthState({ accessToken: "demo-access-token-admin", user: null })).toBe(true);
    expect(isDemoAuthState({ accessToken: "real-token", user: null })).toBe(true);
  });
});
