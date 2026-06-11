import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDemoBlobs,
  getDemoBlob,
  isBrowser,
  loadDemoJson,
  putDemoBlob,
  removeDemoJson,
  saveDemoJson,
} from "@/lib/demo/persistence";

describe("demo persistence - JSON (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("브라우저(jsdom) 환경을 감지한다", () => {
    expect(isBrowser()).toBe(true);
  });

  it("없는 키는 null을 반환한다", () => {
    expect(loadDemoJson("resume")).toBeNull();
  });

  it("save 후 load 라운드트립이 성립한다", () => {
    saveDemoJson("resume", { name: "홍길동222", count: 3 });
    expect(loadDemoJson<{ name: string; count: number }>("resume")).toEqual({
      name: "홍길동222",
      count: 3,
    });
  });

  it("remove 후에는 null을 반환한다", () => {
    saveDemoJson("resume", { a: 1 });
    removeDemoJson("resume");
    expect(loadDemoJson("resume")).toBeNull();
  });

  it("setItem이 실패해도(용량 초과 등) 예외를 던지지 않는다", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => saveDemoJson("resume", { big: "x" })).not.toThrow();
  });

  it("손상된 JSON은 null로 폴백한다", () => {
    localStorage.setItem("demo:resume", "{not-json");
    expect(loadDemoJson("resume")).toBeNull();
  });
});

describe("demo persistence - Blob (indexeddb / in-memory fallback)", () => {
  beforeEach(async () => {
    await clearDemoBlobs();
  });

  it("put 후 get 라운드트립이 성립한다", async () => {
    const blob = new Blob(["hello"], { type: "text/plain" });
    await putDemoBlob("demo/profile-1/x.png", blob);

    const loaded = await getDemoBlob("demo/profile-1/x.png");
    expect(loaded).not.toBeNull();
    expect(loaded?.type).toBe("text/plain");
    expect(await loaded?.text()).toBe("hello");
  });

  it("없는 키는 null을 반환한다", async () => {
    expect(await getDemoBlob("missing")).toBeNull();
  });

  it("clear 후에는 모든 blob이 비워진다", async () => {
    await putDemoBlob("a", new Blob(["a"]));
    await clearDemoBlobs();
    expect(await getDemoBlob("a")).toBeNull();
  });
});
