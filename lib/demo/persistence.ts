/**
 * 데모 모드 영속 어댑터.
 * - 구조화 JSON 상태 → localStorage (작고 동기적, 5MB 한계 안전)
 * - 업로드 바이너리(Blob) → IndexedDB (대용량, 새로고침 후 유지)
 * - SSR/비브라우저/테스트 등 저장소 미가용 시 안전하게 no-op 또는 in-memory 폴백한다.
 *
 * 이력서 데이터 shape나 비데모 경로에는 영향을 주지 않는다.
 */

const JSON_PREFIX = "demo:";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage !== null;
  } catch {
    return false;
  }
}

export function loadDemoJson<T>(key: string): T | null {
  if (!hasLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(JSON_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveDemoJson<T>(key: string, value: T): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(JSON_PREFIX + key, JSON.stringify(value));
  } catch {
    // 용량 초과/직렬화 실패 시 무시 (데모 동작 우선)
  }
}

export function removeDemoJson(key: string): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.removeItem(JSON_PREFIX + key);
  } catch {
    // ignore
  }
}

/* ================================
 * Blob 저장 (IndexedDB / in-memory 폴백)
 * ================================ */

/**
 * IndexedDB 스키마 상수.
 * `public/demo-sw.js`(Service Worker)도 동일한 DB명/버전/스토어명을 사용해야 한다.
 * (SW가 쓴 blob을 여기 `clearDemoBlobs()`가 같은 스토어에서 비울 수 있도록 일치 유지.)
 * 일관성은 `__tests__/uploadSchemaSync.test.ts`가 고정한다.
 */
export const DB_NAME = "demo-uploads";
export const DB_VERSION = 1;
export const STORE_NAME = "blobs";

/** IndexedDB 미가용 환경(SSR/jsdom 등)에서 사용하는 폴백. */
let memoryBlobs: Map<string, Blob> | null = null;
function getMemoryBlobs(): Map<string, Blob> {
  if (!memoryBlobs) memoryBlobs = new Map();
  return memoryBlobs;
}

function hasIndexedDb(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = run(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      })
  );
}

export async function putDemoBlob(objectKey: string, blob: Blob): Promise<void> {
  if (!hasIndexedDb()) {
    getMemoryBlobs().set(objectKey, blob);
    return;
  }
  try {
    await withStore("readwrite", (store) => store.put(blob, objectKey));
  } catch {
    getMemoryBlobs().set(objectKey, blob);
  }
}

export async function getDemoBlob(objectKey: string): Promise<Blob | null> {
  if (!hasIndexedDb()) {
    return getMemoryBlobs().get(objectKey) ?? null;
  }
  try {
    const result = await withStore<Blob | undefined>("readonly", (store) => store.get(objectKey));
    return result ?? null;
  } catch {
    return getMemoryBlobs().get(objectKey) ?? null;
  }
}

export async function clearDemoBlobs(): Promise<void> {
  getMemoryBlobs().clear();
  if (!hasIndexedDb()) return;
  try {
    await withStore("readwrite", (store) => store.clear());
  } catch {
    // ignore
  }
}
