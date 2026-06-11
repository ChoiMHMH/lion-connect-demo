"use client";

import { useState } from "react";
import { clearDemoAuthState } from "@/lib/demoAuthClient";
import { resetAllDemoData } from "@/lib/demo/reset";

const DEMO_LOCAL_STORAGE_KEYS = ["auth-store", "lion-connect-demo-api-log"];

const DEMO_SESSION_STORAGE_KEYS = ["lion-connect-demo-guide-seen"];

export default function DemoResetButton() {
  const [status, setStatus] = useState<"idle" | "clearing" | "done" | "error">("idle");

  const handleReset = async () => {
    setStatus("clearing");

    try {
      await clearDemoAuthState();
      // 이력서/역할 스토어(demo: JSON) + 업로드 바이너리(IndexedDB) 초기화 + 인메모리 재시드.
      await resetAllDemoData();
      DEMO_LOCAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
      DEMO_SESSION_STORAGE_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleReset}
        disabled={status === "clearing"}
        className="h-11 w-fit rounded-md border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-70"
      >
        {status === "clearing" ? "초기화 중..." : "데모 데이터 초기화"}
      </button>
      <p className="text-xs leading-5 text-neutral-500" aria-live="polite">
        {status === "done"
          ? "데모 인증과 이력서·업로드 파일을 모두 초기 상태로 되돌렸습니다."
          : status === "error"
            ? "초기화에 실패했습니다. 새로고침 후 다시 시도해주세요."
            : "데모 인증, 이력서/역할 데이터, 업로드 파일을 모두 처음 상태로 되돌립니다."}
      </p>
    </div>
  );
}
