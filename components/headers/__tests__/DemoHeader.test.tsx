import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DemoHeader from "@/components/headers/DemoHeader";

const mocks = vi.hoisted(() => ({
  activateDemoAuth: vi.fn(),
  pathname: "/dashboard",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/lib/demoAuthClient", () => ({
  activateDemoAuth: mocks.activateDemoAuth,
}));

describe("DemoHeader", () => {
  beforeEach(() => {
    mocks.pathname = "/dashboard";
    mocks.push.mockClear();
    mocks.activateDemoAuth.mockReset();
    mocks.activateDemoAuth.mockResolvedValue({ homeRoute: "/" });
    window.history.pushState({}, "", "/dashboard");
  });

  it("좌측 브랜드 링크 클릭 시 기업 데모 홈으로 전환한다", async () => {
    const user = userEvent.setup();
    render(<DemoHeader currentRole="demo_talent" />);

    const brandLink = screen.getByRole("link", { name: /LionConnect Demo/ });

    expect(brandLink).toHaveAttribute("href", "/");

    await user.click(brandLink);

    await waitFor(() => {
      expect(mocks.activateDemoAuth).toHaveBeenCalledWith("demo_company");
    });
    expect(mocks.push).toHaveBeenCalledWith("/");
  });

  it("기업 데모 홈에서는 기업 홈 링크를 현재 메뉴로 표시한다", () => {
    mocks.pathname = "/";

    render(<DemoHeader currentRole="demo_company" />);

    expect(screen.getByRole("link", { name: "기업 홈" })).toHaveAttribute("aria-current", "page");
  });
});
