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
  it("데모 전용 모드에서는 쿠키 없이도 주요 경로를 로그인으로 보내지 않는다", () => {
    expect(locationOf(middleware(request("/talents")))).toBeNull();
    expect(locationOf(middleware(request("/jobs")))).toBeNull();
    expect(locationOf(middleware(request("/admin/users")))).toBeNull();
    expect(locationOf(middleware(request("/dashboard/profile")))).toBeNull();
    expect(locationOf(middleware(request("/login")))).toBeNull();
  });

  it("데모 전용 모드에서도 레거시 멤버 URL은 dashboard 하위 경로로 보정한다", () => {
    expect(locationOf(middleware(request("/profile/1")))).toBe(
      "https://lion-connect.test/dashboard/profile/1"
    );
  });

  it("기업 demo cookie만으로 /talents와 /jobs 보호 라우트를 통과한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_company`;

    expect(locationOf(middleware(request("/talents", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/jobs", cookie)))).toBeNull();
  });

  it("데모 전용 모드에서는 인재 demo cookie여도 기업 보호 라우트를 통과한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_talent`;

    expect(locationOf(middleware(request("/dashboard/profile", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/dashboard/applications", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/talents", cookie)))).toBeNull();
  });

  it("데모 전용 모드에서는 루트 하위 경로를 role 기준으로 리다이렉트하지 않는다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_talent`;

    expect(locationOf(middleware(request("/demo", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/demo/admin", cookie)))).toBeNull();
    expect(locationOf(middleware(request("/about", cookie)))).toBeNull();
  });

  it("관리자 demo cookie만으로 /admin 보호 라우트를 통과한다", () => {
    const cookie = `${DEMO_AUTH_COOKIE}=demo_admin`;

    expect(locationOf(middleware(request("/admin/users", cookie)))).toBeNull();
  });
});
