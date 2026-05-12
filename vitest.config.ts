import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/.{idea,git,cache,output,temp}/**", "e2e/**"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["lib/**", "app/**/_actions/**"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
