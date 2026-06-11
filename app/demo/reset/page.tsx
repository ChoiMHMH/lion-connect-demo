"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetAllDemoData } from "@/lib/demo/reset";

function safeReturnTo(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/**
 * 데모 데이터를 초기 시드 상태로 되돌린 뒤 홈(또는 returnTo)으로 이동한다.
 * localStorage(JSON) + IndexedDB(업로드 blob)를 모두 비운다.
 */
export default function DemoResetPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const destination = safeReturnTo(searchParams.get("returnTo")) ?? "/";

    resetAllDemoData()
      .then(() => {
        if (!isMounted) return;
        // 인메모리 스토어까지 시드로 다시 채우도록 전체 새로고침으로 이동한다.
        window.location.assign(destination);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("데모 데이터를 초기화하지 못했습니다.");
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <section
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-brand-05">LionConnect Demo</p>
        <h1 className="mt-2 font-title text-xl font-bold text-neutral-900">
          데모 데이터를 초기화하고 있습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          수정한 이력서와 업로드 파일을 처음 상태로 되돌린 뒤 이동합니다.
        </p>
        {errorMessage ? (
          <p className="mt-4 text-sm font-semibold text-red-600">{errorMessage}</p>
        ) : null}
      </section>
    </main>
  );
}
