/*
 * 데모 모드 전용 Service Worker (무의존, 직접 작성).
 *
 * 역할: `/api/demo/uploads/*` 요청만 가로채 업로드 바이너리를 IndexedDB에 영속화하고 서빙한다.
 *  - PUT/POST : 요청 body(Blob)를 IndexedDB에 저장하고 204를 반환한다.
 *  - GET      : IndexedDB에서 서빙하고, 없으면 서버 라우트(`fetch`)로 폴백한다.
 *  - 그 외 경로/메서드는 절대 건드리지 않는다(respondWith 호출 안 함 → 기본 네트워크 동작).
 *
 * 스키마는 `lib/demo/persistence.ts`와 반드시 일치해야 한다(같은 스토어를 reset이 비움).
 *   DB: "demo-uploads" / version 1 / objectStore "blobs" / key = objectKey
 */

const DB_NAME = "demo-uploads";
const DB_VERSION = 1;
const STORE_NAME = "blobs";
const UPLOAD_PREFIX = "/api/demo/uploads/";

function openDb() {
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

function idbPut(key, blob) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(blob, key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

function idbGet(key) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => {
          db.close();
          resolve(req.result || null);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      })
  );
}

/** `/api/demo/uploads/{objectKey}` 에서 objectKey만 추출. 데모 업로드 외 요청은 null. */
function objectKeyFromUrl(rawUrl) {
  let pathname;
  try {
    pathname = new URL(rawUrl).pathname;
  } catch {
    return null;
  }
  if (!pathname.startsWith(UPLOAD_PREFIX)) return null;
  const key = pathname.slice(UPLOAD_PREFIX.length);
  if (!key) return null;
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const key = objectKeyFromUrl(request.url);
  if (!key) return; // 데모 업로드 외 요청은 기본 네트워크 동작에 맡긴다.

  const method = request.method.toUpperCase();

  if (method === "PUT" || method === "POST") {
    event.respondWith(
      request.blob().then(
        (blob) =>
          idbPut(key, blob).then(
            () => new Response(null, { status: 204 }),
            () => fetch(request) // 저장 실패 시 서버 라우트 폴백
          ),
        () => fetch(request)
      )
    );
    return;
  }

  if (method === "GET") {
    event.respondWith(
      idbGet(key).then(
        (blob) => {
          if (blob) {
            return new Response(blob, {
              status: 200,
              headers: {
                "Content-Type": blob.type || "application/octet-stream",
                "Cache-Control": "no-store",
              },
            });
          }
          return fetch(request); // IndexedDB에 없으면 서버 라우트 폴백
        },
        () => fetch(request)
      )
    );
  }
});
