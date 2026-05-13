import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DemoRoleEntryPage from "@/app/demo/enter/[role]/page";
import { DEMO_AUTH_PROFILES } from "@/constants/demoAuth";

const mockReplace = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn());
const mockSearchParamsGet = vi.hoisted(() => vi.fn());
const mockActivateDemoAuth = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useParams: mockUseParams,
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

vi.mock("@/lib/demoAuthClient", () => ({
  activateDemoAuth: mockActivateDemoAuth,
}));

describe("DemoRoleEntryPage", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseParams.mockReset();
    mockSearchParamsGet.mockReset();
    mockActivateDemoAuth.mockReset();
  });

  it("talent 진입 URL에서 데모 인증을 설정한 뒤 returnTo 보호 라우트로 이동한다", async () => {
    mockUseParams.mockReturnValue({ role: "talent" });
    mockSearchParamsGet.mockReturnValue("/dashboard/profile");
    mockActivateDemoAuth.mockResolvedValue(DEMO_AUTH_PROFILES.demo_talent);

    render(<DemoRoleEntryPage />);

    expect(screen.getByText("데모 인증을 준비하고 있습니다")).toBeVisible();

    await waitFor(() => {
      expect(mockActivateDemoAuth).toHaveBeenCalledWith("demo_talent");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard/profile");
    });
  });

  it("returnTo가 없으면 role별 home route로 이동한다", async () => {
    mockUseParams.mockReturnValue({ role: "company" });
    mockSearchParamsGet.mockReturnValue(null);
    mockActivateDemoAuth.mockResolvedValue(DEMO_AUTH_PROFILES.demo_company);

    render(<DemoRoleEntryPage />);

    await waitFor(() => {
      expect(mockActivateDemoAuth).toHaveBeenCalledWith("demo_company");
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("알 수 없는 role은 데모 인증 없이 랜딩으로 보낸다", async () => {
    mockUseParams.mockReturnValue({ role: "unknown" });

    render(<DemoRoleEntryPage />);

    await waitFor(() => {
      expect(mockActivateDemoAuth).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
