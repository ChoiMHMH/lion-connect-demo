"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getDemoRoleFromRouteSegment } from "@/constants/demoAuth";
import { activateDemoAuth } from "@/lib/demoAuthClient";

function safeReturnTo(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default function DemoRoleEntryPage() {
  const params = useParams<{ role?: string | string[] }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const role = getDemoRoleFromRouteSegment(params.role);

    if (!role) {
      router.replace("/");
      return;
    }

    let isMounted = true;

    activateDemoAuth(role)
      .then((profile) => {
        if (!isMounted) return;
        router.replace(safeReturnTo(searchParams.get("returnTo")) ?? profile.homeRoute);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("데모 인증을 초기화하지 못했습니다.");
      });

    return () => {
      isMounted = false;
    };
  }, [params.role, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <section
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-brand-05">LionConnect Demo</p>
        <h1 className="mt-2 font-title text-xl font-bold text-neutral-900">
          데모 인증을 준비하고 있습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          실제 로그인 없이 데모 role과 접근 권한을 설정한 뒤 화면으로 이동합니다.
        </p>
        {errorMessage ? (
          <p className="mt-4 text-sm font-semibold text-red-600">{errorMessage}</p>
        ) : null}
      </section>
    </main>
  );
}
