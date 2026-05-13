import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { DEMO_AUTH_COOKIE } from "@/constants/demoAuth";
import { middleware } from "@/middleware";

function request(pathname: string, cookie?: string) {
  return new NextRequest(`https://lion-connect.test${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

function locationOf(response: Response) {
  return response.headers.get("location");
}

describe("middleware demo auth", () => {
  it("기업 demo cookie만으로 /talents와 /jobs 보호 라우트를 통과한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_company`;

    expect(locationOf(middleware(request("/talents", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/jobs", cookie)))).toBeNull();
  });

  it("인재 demo cookie는 인재 보호 라우트를 통과하되 기업 보호 라우트는 RBAC로 제한한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_talent`;

    expect(locationOf(middleware(request("/dashboard/profile", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/dashboard/applications", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/talents", cookie)))).toBe(
      "https://lion-connect.test/dashboard"
    );
  });

  it("인재 demo cookie에서도 demo hub 경로는 루트 하위 경로 리다이렉트에서 제외한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_talent`;

    expect(locationOf(middleware(request("/demo", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/demo/admin", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/about", cookie)))).toBe(
      "https://lion-connect.test/dashboard"
    );
  });

  it("관리자 demo cookie만으로 /admin 보호 라우트를 통과한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_admin`;

    expect(locationOf(middleware(request("/admin/users", cookie)))).toBeNull();
  });
});
