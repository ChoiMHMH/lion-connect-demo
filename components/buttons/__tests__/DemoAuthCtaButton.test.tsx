import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DemoAuthCtaButton from "@/components/buttons/DemoAuthCtaButton";
import { DemoGuideProvider } from "@/contexts/DemoGuideContext";

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("DemoAuthCtaButton", () => {
  it("로그인/회원가입 CTA 클릭 시 실제 로그인 대신 서버 종료 안내 모달을 연다", async () => {
    window.history.pushState({}, "", "/");
    window.sessionStorage.setItem("lion-connect-demo-guide-seen", "true");

    render(
      <DemoGuideProvider>
        <DemoAuthCtaButton className="test-class" />
      </DemoGuideProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "로그인/회원가입" }));

    expect(screen.getByText("서버 종료 안내")).toBeVisible();
    expect(screen.getByRole("button", { name: "데모 페이지로 이동" })).toBeVisible();
    expect(mockPush).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "데모 페이지로 이동" }));

    expect(mockPush).toHaveBeenCalledWith("/demo");
  });
});
