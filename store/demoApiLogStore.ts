"use client";

import { create } from "zustand";

export type DemoApiLogEntry = {
  id: string;
  method: string;
  path: string;
  status: number | "ERR";
  durationMs: number;
  timestamp: number;
};

type DemoApiLogState = {
  entries: DemoApiLogEntry[];
  addEntry: (entry: Omit<DemoApiLogEntry, "id" | "timestamp">) => void;
  clearEntries: () => void;
};

const MAX_DEMO_API_LOG_ENTRIES = 50;

export const useDemoApiLogStore = create<DemoApiLogState>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: Date.now(),
        },
        ...state.entries,
      ].slice(0, MAX_DEMO_API_LOG_ENTRIES),
    })),
  clearEntries: () => set({ entries: [] }),
}));

export function recordDemoApiLog(entry: Omit<DemoApiLogEntry, "id" | "timestamp">) {
  useDemoApiLogStore.getState().addEntry(entry);
}
