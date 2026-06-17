/**
 * 쿼리 스트링 조립 유틸
 *
 * 도메인 API 함수마다 반복되던 `URLSearchParams` 조립을 한 곳으로 모은다.
 * 규칙:
 * - `undefined` / `null` 값은 생략한다.
 * - 빈 문자열(`""`)은 값으로 포함한다. (예: 관리자 공고 목록의 `status=`)
 * - 배열은 같은 key로 반복 append 하고, 빈 배열은 생략한다.
 * - 숫자 0, boolean false 등도 값으로 포함한다.
 * - 결과 쿼리가 비면 endpoint를 그대로 반환한다(trailing `?` 미부착).
 */

export type QueryPrimitive = string | number | boolean;

export type QueryParams = Record<string, QueryPrimitive | QueryPrimitive[] | null | undefined>;

export function withQuery(endpoint: string, params: QueryParams = {}): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) {
          continue;
        }
        search.append(key, String(item));
      }
      continue;
    }

    search.append(key, String(value));
  }

  const queryString = search.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}
