import { beforeEach, describe, expect, it, vi } from "vitest";
import { serverGet } from "@/lib/serverApiClient";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
  headers: mocks.headers,
}));

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("serverApiClient demo mode", () => {
  beforeEach(() => {
    mocks.cookies.mockReset();
    mocks.headers.mockReset();
    mocks.cookies.mockResolvedValue({ get: () => undefined });
    mocks.headers.mockResolvedValue({
      get: (key: string) => {
        if (key === "x-forwarded-host") return "lion-connect.test";
        if (key === "x-forwarded-proto") return "https";
        return null;
      },
    });
  });

  it("demo-only 모드에서는 cookie가 없어도 /api/demo base를 사용한다", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(jsonResponse({ ok: true }));

    await serverGet("/job-postings");

    expect(fetchMock.mock.calls[0][0]).toBe("https://lion-connect.test/api/demo/job-postings");
  });
});
