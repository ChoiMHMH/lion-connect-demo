"use client";

import { useMemo, useState } from "react";
import { isDemoAuthState } from "@/lib/demoMode";
import { useAuthStore } from "@/store/authStore";
import { useDemoApiLogStore } from "@/store/demoApiLogStore";
import { cn } from "@/utils/utils";

export default function DemoApiLogPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const { accessToken, user } = useAuthStore();
  const { entries, clearEntries } = useDemoApiLogStore();
  const isDemoMode = isDemoAuthState({ accessToken, user });

  const latestLabel = useMemo(() => {
    const latest = entries[0];
    if (!latest) return "호출 대기";
    return `${latest.method} ${latest.path} ${latest.status}`;
  }, [entries]);

  if (!isDemoMode) return null;

  return (
    <aside className="fixed right-4 bottom-4 z-40 w-[min(420px,calc(100vw-32px))] rounded-lg border border-neutral-200 bg-white shadow-xl">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-bold text-neutral-900">Demo API Log</span>
          <span className="truncate text-xs text-neutral-500">{latestLabel}</span>
        </span>
        <span className="shrink-0 rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-brand-06">
          {entries.length}
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-neutral-200">
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-xs font-semibold text-neutral-500">최근 50개 요청</p>
            <button
              type="button"
              onClick={clearEntries}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              비우기
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto px-2 pb-2">
            {entries.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-neutral-500">
                데모 API 호출이 아직 없습니다.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[56px_1fr_52px_64px] gap-2 rounded-md px-2 py-2 text-xs hover:bg-neutral-50"
                >
                  <span className="font-bold text-neutral-700">{entry.method}</span>
                  <span className="truncate font-mono text-neutral-600">{entry.path}</span>
                  <span
                    className={cn(
                      "font-bold",
                      entry.status === "ERR" || entry.status >= 400
                        ? "text-red-600"
                        : "text-emerald-700"
                    )}
                  >
                    {entry.status}
                  </span>
                  <span className="text-right text-neutral-500">{entry.durationMs}ms</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
