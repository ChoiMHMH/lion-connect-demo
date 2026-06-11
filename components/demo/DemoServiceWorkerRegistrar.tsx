"use client";

import { useEffect } from "react";
import { registerDemoServiceWorker } from "@/lib/demo/registerDemoServiceWorker";

/**
 * 데모 모드에서 업로드 영속 Service Worker를 마운트 시 1회 등록한다.
 * 미지원/비데모 환경에서는 등록 유틸이 no-op이므로 항상 안전하게 렌더 가능.
 */
export default function DemoServiceWorkerRegistrar() {
  useEffect(() => {
    void registerDemoServiceWorker();
  }, []);

  return null;
}
