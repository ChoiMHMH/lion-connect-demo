import { describe, it, expect } from "vitest";
import { isClientServedImage } from "@/utils/imageSrc";

describe("isClientServedImage", () => {
  it("blob:/data: 클라이언트 메모리 src는 unoptimized 대상이다", () => {
    expect(isClientServedImage("blob:http://localhost/abc")).toBe(true);
    expect(isClientServedImage("data:image/png;base64,iVBOR")).toBe(true);
  });

  it("데모 업로드 경로(쿼리 캐시버스터 포함)는 unoptimized 대상이다", () => {
    expect(isClientServedImage("/api/demo/uploads/demo/profile-1/photo.png")).toBe(true);
    expect(isClientServedImage("/api/demo/uploads/demo/profile-1/photo.png?v=123")).toBe(true);
  });

  it("정적 에셋/외부 https/그 외 값은 최적화를 유지한다", () => {
    expect(isClientServedImage("/images/default-profile.png")).toBe(false);
    expect(isClientServedImage("https://lion-connect-files.s3.amazonaws.com/a.png")).toBe(false);
    expect(isClientServedImage("/api/demo/profile/1")).toBe(false);
    expect(isClientServedImage(undefined)).toBe(false);
    expect(isClientServedImage(null)).toBe(false);
  });
});
