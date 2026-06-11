import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const clearDemoAuthState = vi.fn();
const resetAllDemoData = vi.fn();

vi.mock("@/lib/demoAuthClient", () => ({
  clearDemoAuthState: () => clearDemoAuthState(),
}));

vi.mock("@/lib/demo/reset", () => ({
  resetAllDemoData: () => resetAllDemoData(),
}));

import DemoResetButton from "@/app/demo/_components/DemoResetButton";

describe("DemoResetButton", () => {
  const originalLocation = window.location;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clearDemoAuthState.mockResolvedValue(undefined);
    resetAllDemoData.mockResolvedValue(undefined);
    reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });
    window.localStorage.setItem("auth-store", "x");
    window.localStorage.setItem("lion-connect-demo-api-log", "x");
    window.sessionStorage.setItem("lion-connect-demo-guide-seen", "x");
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("이력서/업로드까지 포함해 완전 초기화한 뒤 전체 새로고침한다", async () => {
    const user = userEvent.setup();
    render(<DemoResetButton />);

    await user.click(screen.getByRole("button", { name: "데모 데이터 초기화" }));

    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    // auth 정리 + 이력서/역할/IndexedDB 초기화(resetAllDemoData) 모두 호출
    expect(clearDemoAuthState).toHaveBeenCalledTimes(1);
    expect(resetAllDemoData).toHaveBeenCalledTimes(1);

    // 남은 localStorage/sessionStorage 키는 새로고침 전에 정리된다.
    expect(window.localStorage.getItem("auth-store")).toBeNull();
    expect(window.localStorage.getItem("lion-connect-demo-api-log")).toBeNull();
    expect(window.sessionStorage.getItem("lion-connect-demo-guide-seen")).toBeNull();
  });

  it("초기화 실패 시 에러 메시지를 보여준다", async () => {
    resetAllDemoData.mockRejectedValueOnce(new Error("boom"));
    const user = userEvent.setup();
    render(<DemoResetButton />);

    await user.click(screen.getByRole("button", { name: "데모 데이터 초기화" }));

    await waitFor(() => {
      expect(
        screen.getByText("초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.")
      ).toBeInTheDocument();
    });
  });
});
