import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DB_NAME, DB_VERSION, STORE_NAME } from "@/lib/demo/persistence";

/**
 * Service Worker(`public/demo-sw.js`)와 영속 어댑터(`lib/demo/persistence.ts`)는
 * 동일한 IndexedDB 스키마를 써야 한다. 그래야 `clearDemoBlobs()`가 SW가 쓴 blob을
 * 같은 스토어에서 비울 수 있다. SW는 무의존 plain JS라 상수를 import 할 수 없으므로
 * 파일 텍스트로 일관성을 고정한다.
 */
describe("데모 업로드 IndexedDB 스키마 동기화", () => {
  const swSource = readFileSync(path.resolve(__dirname, "../../../public/demo-sw.js"), "utf-8");

  it("SW가 persistence 와 동일한 DB명/스토어명을 사용한다", () => {
    expect(swSource).toContain(`"${DB_NAME}"`);
    expect(swSource).toContain(`"${STORE_NAME}"`);
  });

  it("SW가 persistence 와 동일한 DB 버전을 사용한다", () => {
    expect(swSource).toMatch(new RegExp(`DB_VERSION\\s*=\\s*${DB_VERSION}\\b`));
  });

  it("SW는 /api/demo/uploads/ 경로만 가로챈다", () => {
    expect(swSource).toContain("/api/demo/uploads/");
  });
});
