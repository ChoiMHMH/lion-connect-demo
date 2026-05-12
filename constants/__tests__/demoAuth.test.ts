import { describe, expect, it } from "vitest";
import {
  DEMO_ACCESS_TOKEN_PREFIX,
  DEMO_AUTH_COOKIE,
  DEMO_AUTH_PROFILES,
  getDemoRoleFromRouteSegment,
  getDemoAuthProfile,
  isDemoRole,
} from "@/constants/demoAuth";

describe("demoAuth constants", () => {
  it("역할별 demo user, RBAC roles, home route, demo token을 구분한다", () => {
    expect(DEMO_AUTH_COOKIE).toBe("lion-connect-demo-role");

    expect(DEMO_AUTH_PROFILES.demo_talent).toMatchObject({
      label: "인재 데모",
      homeRoute: "/dashboard",
      roles: ["USER", "JOINEDUSER"],
      accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}talent`,
    });

    expect(DEMO_AUTH_PROFILES.demo_company).toMatchObject({
      label: "기업 데모",
      homeRoute: "/talents",
      roles: ["COMPANY", "JOINEDCOMPANY"],
      accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}company`,
    });

    expect(DEMO_AUTH_PROFILES.demo_admin).toMatchObject({
      label: "관리자 데모",
      homeRoute: "/admin",
      roles: ["ADMIN"],
      accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}admin`,
    });
  });

  it("알 수 없는 role 문자열은 demo role로 취급하지 않는다", () => {
    expect(isDemoRole("demo_talent")).toBe(true);
    expect(isDemoRole("JOINEDUSER")).toBe(false);
    expect(getDemoAuthProfile("JOINEDUSER")).toBeNull();
  });

  it("demo entry route segment를 demo role로 변환한다", () => {
    expect(getDemoRoleFromRouteSegment("talent")).toBe("demo_talent");
    expect(getDemoRoleFromRouteSegment("company")).toBe("demo_company");
    expect(getDemoRoleFromRouteSegment("admin")).toBe("demo_admin");
    expect(getDemoRoleFromRouteSegment("demo_talent")).toBe("demo_talent");
    expect(getDemoRoleFromRouteSegment("unknown")).toBeNull();
  });
});
