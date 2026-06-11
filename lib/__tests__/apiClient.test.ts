/**
 * apiClient 단위 테스트 (T2: 기본 요청 · 타임아웃 · skipAuth)
 *
 * 검증 대상:
 * - 200 JSON 응답 그대로 반환
 * - 204 / content-length:0 응답 → 빈 객체
 * - 타임아웃 → ApiError code "TIMEOUT"
 * - skipAuth: true → Authorization 헤더 없음
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// 데모 모드 판정을 테스트별로 제어한다.
// 기본은 비데모(false)라서 fetch 전송/응답 처리 경로를 그대로 검증할 수 있고,
// 데모 전용 테스트에서만 true로 바꿔 브라우저 로컬 디스패치(#2/#4) 동작을 검증한다.
vi.mock("@/lib/demoMode", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/demoMode")>();
  return { ...actual, isDemoAuthState: vi.fn(() => false) };
});

import { get, ApiError } from "@/lib/apiClient";
import { isDemoAuthState } from "@/lib/demoMode";
import { DEMO_AUTH_PROFILES } from "@/constants/demoAuth";
import { useDemoApiLogStore } from "@/store/demoApiLogStore";
import { useAuthStore } from "@/store/authStore";
import { resetDemoResumeStore } from "@/lib/demo/resumeStore";

const mockedIsDemo = vi.mocked(isDemoAuthState);

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function emptyOkResponse(): Response {
  return new Response("", {
    status: 200,
    headers: { "content-length": "0" },
  });
}

describe("apiClient — 기본 동작", () => {
  beforeEach(() => {
    mockedIsDemo.mockReturnValue(false);
    localStorage.clear();
    resetDemoResumeStore();
    useAuthStore.setState({ accessToken: "access-token", user: null });
    useDemoApiLogStore.getState().clearEntries();
  });

  afterEach(() => {
    useAuthStore.setState({ accessToken: null, user: null });
    useDemoApiLogStore.getState().clearEntries();
    vi.restoreAllMocks();
  });

  it("200 JSON 응답을 그대로 반환한다", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await get<{ ok: boolean }>("/test");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("204 No Content 응답은 빈 객체로 반환한다", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(noContentResponse());

    const result = await get<Record<string, never>>("/test");

    expect(result).toEqual({});
  });

  it("content-length: 0 응답은 빈 객체로 반환한다", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(emptyOkResponse());

    const result = await get<Record<string, never>>("/test");

    expect(result).toEqual({});
  });

  it("타임아웃(AbortError) 발생 시 ApiError code TIMEOUT 을 throw 한다", async () => {
    vi.spyOn(global, "fetch").mockImplementationOnce(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    await expect(get("/test")).rejects.toMatchObject({
      name: "ApiError",
      code: "TIMEOUT",
    });
  });

  it("skipAuth: true 이면 Authorization 헤더를 붙이지 않는다", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(jsonResponse({ ok: 1 }));

    await get("/public", { skipAuth: true });

    const call = fetchMock.mock.calls[0];
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("skipAuth 미지정 시 Zustand 토큰으로 Authorization 헤더를 붙인다", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(jsonResponse({ ok: 1 }));

    await get("/private");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer access-token");
  });

  it("demo 상대 endpoint는 네트워크 없이 로컬 디스패치되고 로그를 기록한다", async () => {
    mockedIsDemo.mockReturnValue(true);
    useAuthStore.setState({
      accessToken: DEMO_AUTH_PROFILES.demo_talent.accessToken,
      user: DEMO_AUTH_PROFILES.demo_talent.user,
    });
    const fetchMock = vi.spyOn(global, "fetch");

    const result = await get<{ name: string }>("/profile/me?profileId=1");

    // 데모 스토어(시드)에서 직접 응답 → fetch 미호출
    expect(result.name).toBe("홍길동");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useDemoApiLogStore.getState().entries).toMatchObject([
      {
        method: "GET",
        path: "/api/demo/profile/me?profileId=1",
        status: 200,
      },
    ]);
  });

  it("demo auth state에서도 절대 URL은 /api/demo으로 바꾸지 않고 네트워크로 보낸다", async () => {
    mockedIsDemo.mockReturnValue(true);
    useAuthStore.setState({
      accessToken: DEMO_AUTH_PROFILES.demo_talent.accessToken,
      user: DEMO_AUTH_PROFILES.demo_talent.user,
    });
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(jsonResponse({ ok: true }));

    await get("https://files.example.test/item.json");

    expect(fetchMock.mock.calls[0][0]).toBe("https://files.example.test/item.json");
    expect(useDemoApiLogStore.getState().entries).toEqual([]);
  });

  it("ApiError 타입이 export 되어 있다 (타입 체크용 sanity)", () => {
    expect(ApiError).toBeDefined();
    const e = new ApiError("msg", 500, "SERVER_ERROR");
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(500);
  });
});
