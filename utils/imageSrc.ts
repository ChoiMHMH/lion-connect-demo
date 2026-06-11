/**
 * Next.js `<Image>` 최적화는 `/_next/image?url=...` 경유로 **서버 사이드에서** src를 fetch한다.
 * 아래 출처들은 브라우저에만 존재하므로 서버 옵티마이저가 가져올 수 없다 → `unoptimized` 가 필요하다.
 * (안 그러면 옵티마이저가 빈/없는 리소스를 받아 깨진 이미지 = alt 텍스트가 노출된다.)
 *
 * - `blob:` / `data:`     : 클라이언트 메모리 (예: 파일 선택 직후 objectURL 미리보기)
 * - `/api/demo/uploads/`  : 데모 업로드. Service Worker가 브라우저 IndexedDB에서 서빙한다.
 *
 * 매칭되지 않는 src(정적 에셋, 외부 S3 https 등)에는 영향이 없으므로 어디에 적용해도 안전하다.
 */
export function isClientServedImage(src: unknown): boolean {
  if (typeof src !== "string") return false;
  return src.startsWith("blob:") || src.startsWith("data:") || src.startsWith("/api/demo/uploads/");
}
