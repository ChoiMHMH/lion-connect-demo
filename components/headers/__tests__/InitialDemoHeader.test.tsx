import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminHeader from "@/components/headers/AdminHeader";
import CompanyHeader from "@/components/headers/CompanyHeader";
import MemberHeader from "@/components/headers/MemberHeader";

const mocks = vi.hoisted(() => ({
  user: null as { id: number; email: string } | null,
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    user: mocks.user,
  }),
}));

vi.mock("@/hooks/auth/useLogout", () => ({
  useLogout: () => ({
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/common/useNavigation", () => ({
  useNavigation: () => ({
    navRefs: { current: [] },
    handleNavClick: vi.fn(),
    isLinkActive: () => false,
  }),
}));

vi.mock("@/components/headers/DemoHeader", () => ({
  default: ({ currentRole }: { currentRole: string }) => (
    <div data-testid="demo-header">Demo header: {currentRole}</div>
  ),
}));

describe("role headers initial demo role", () => {
  beforeEach(() => {
    mocks.user = null;
  });

  it("MemberHeader는 auth store hydration 전 initial demo role로 DemoHeader를 렌더링한다", () => {
    render(<MemberHeader initialDemoRole="demo_talent" />);

    expect(screen.getByTestId("demo-header")).toHaveTextContent("demo_talent");
  });

  it("CompanyHeader는 auth store hydration 전 initial demo role로 DemoHeader를 렌더링한다", () => {
    render(<CompanyHeader initialDemoRole="demo_company" />);

    expect(screen.getByTestId("demo-header")).toHaveTextContent("demo_company");
  });

  it("AdminHeader는 auth store hydration 전 initial demo role로 DemoHeader를 렌더링한다", () => {
    render(<AdminHeader initialDemoRole="demo_admin" />);

    expect(screen.getByTestId("demo-header")).toHaveTextContent("demo_admin");
  });

  it("데모 전용 모드에서는 initial role이 없어도 role별 기본 DemoHeader를 렌더링한다", () => {
    const { unmount } = render(<CompanyHeader />);

    expect(screen.getByTestId("demo-header")).toHaveTextContent("demo_company");
    unmount();

    render(<MemberHeader />);

    expect(screen.getByTestId("demo-header")).toHaveTextContent("demo_talent");
  });
});
