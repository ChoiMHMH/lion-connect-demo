import { beforeEach, describe, expect, it } from "vitest";
import { recordDemoApiLog, useDemoApiLogStore } from "@/store/demoApiLogStore";

describe("demoApiLogStore", () => {
  beforeEach(() => {
    useDemoApiLogStore.getState().clearEntries();
  });

  it("API 로그를 최신순으로 저장한다", () => {
    recordDemoApiLog({ method: "GET", path: "/api/demo/profile/me", status: 200, durationMs: 12 });
    recordDemoApiLog({ method: "POST", path: "/api/demo/profile/me", status: 201, durationMs: 8 });

    expect(useDemoApiLogStore.getState().entries).toMatchObject([
      { method: "POST", path: "/api/demo/profile/me", status: 201, durationMs: 8 },
      { method: "GET", path: "/api/demo/profile/me", status: 200, durationMs: 12 },
    ]);
  });

  it("최대 50개만 유지한다", () => {
    Array.from({ length: 55 }, (_, index) => {
      recordDemoApiLog({
        method: "GET",
        path: `/api/demo/items/${index}`,
        status: 200,
        durationMs: index,
      });
    });

    const entries = useDemoApiLogStore.getState().entries;
    expect(entries).toHaveLength(50);
    expect(entries[0].path).toBe("/api/demo/items/54");
    expect(entries[49].path).toBe("/api/demo/items/5");
  });
});
