import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoGuideProvider, useDemoGuide } from "@/contexts/DemoGuideContext";

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

function ServerClosedButton() {
  const { openServerClosedGuide } = useDemoGuide();

  return (
    <button type="button" onClick={openServerClosedGuide}>
      서버 종료 모달 열기
    </button>
  );
}

describe("DemoGuideProvider", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.sessionStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("랜딩 첫 진입에 포트폴리오 데모 안내를 한 세션 1회 표시한다", async () => {
    const { unmount } = render(
      <DemoGuideProvider>
        <div>landing</div>
      </DemoGuideProvider>
    );

    expect(await screen.findByText("포트폴리오 데모 안내")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "계속 랜딩 보기" }));
    expect(screen.queryByText("포트폴리오 데모 안내")).not.toBeInTheDocument();

    unmount();

    render(
      <DemoGuideProvider>
        <div>landing again</div>
      </DemoGuideProvider>
    );

    expect(screen.queryByText("포트폴리오 데모 안내")).not.toBeInTheDocument();
  });

  it("데모 둘러보기 버튼은 /demo로 이동한다", async () => {
    render(
      <DemoGuideProvider>
        <div>landing</div>
      </DemoGuideProvider>
    );

    await userEvent.click(await screen.findByRole("button", { name: "데모 둘러보기" }));

    expect(mockPush).toHaveBeenCalledWith("/demo");
  });

  it("서버 종료 안내 모달을 전역 API로 열 수 있다", async () => {
    window.history.pushState({}, "", "/login");

    render(
      <DemoGuideProvider>
        <ServerClosedButton />
      </DemoGuideProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "서버 종료 모달 열기" }));

    expect(screen.getByText("서버 종료 안내")).toBeVisible();
    expect(screen.getByText(/실제 로그인은 현재 제공되지 않습니다/)).toBeVisible();
  });

  it("Demo 안내 고정 버튼으로 포트폴리오 데모 안내를 다시 열 수 있다", async () => {
    window.history.pushState({}, "", "/dashboard");

    render(
      <DemoGuideProvider>
        <div>dashboard</div>
      </DemoGuideProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "포트폴리오 데모 안내 열기" }));

    expect(screen.getByText("포트폴리오 데모 안내")).toBeVisible();
  });
});
