import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import DemoApiLogPanel from "@/components/demo/DemoApiLogPanel";
import { DEMO_AUTH_PROFILES } from "@/constants/demoAuth";
import { useAuthStore } from "@/store/authStore";
import { recordDemoApiLog, useDemoApiLogStore } from "@/store/demoApiLogStore";

describe("DemoApiLogPanel", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
    useDemoApiLogStore.getState().clearEntries();
  });

  it("demo-only mode에서는 인증 상태가 비어 있어도 렌더링한다", () => {
    render(<DemoApiLogPanel />);

    expect(screen.getByText("Demo API Log")).toBeVisible();
    expect(screen.getByText("데모 API 호출이 아직 없습니다.")).toBeVisible();
  });

  it("demo mode에서 최근 API 호출을 접이식 패널에 표시한다", () => {
    useAuthStore.setState({
      accessToken: DEMO_AUTH_PROFILES.demo_talent.accessToken,
      user: DEMO_AUTH_PROFILES.demo_talent.user,
      isAuthenticated: true,
    });
    recordDemoApiLog({ method: "GET", path: "/api/demo/profile/me", status: 200, durationMs: 15 });

    render(<DemoApiLogPanel />);

    expect(screen.getByText("Demo API Log")).toBeVisible();
    expect(screen.getByText("GET /api/demo/profile/me 200")).toBeVisible();
    expect(screen.getByText("/api/demo/profile/me")).toBeVisible();
    expect(screen.getByText("15ms")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Demo API Log/ }));

    expect(screen.queryByText("/api/demo/profile/me")).not.toBeInTheDocument();
  });
});
