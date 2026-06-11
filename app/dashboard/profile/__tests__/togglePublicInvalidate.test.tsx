import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

// #3: 공개 토글 성공 시 인재탐색(talents) 캐시도 무효화되어야 한다.

const updateProfileMock = vi.fn().mockResolvedValue({});

vi.mock("@/hooks/talent/queries/useMyProfiles", () => ({
  useMyProfiles: () => ({
    data: [
      {
        id: 1,
        name: "홍길동",
        title: "프론트엔드 포트폴리오 이력서",
        introduction: "소개",
        storageUrl: "/demo/profile-demo.png",
        likelihoodCode: null,
        visibility: "PUBLIC",
        status: "COMPLETED",
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/lib/api/profiles", () => ({
  updateProfile: (...args: unknown[]) => updateProfileMock(...args),
  createEmptyProfile: vi.fn(),
  deleteProfile: vi.fn(),
}));

vi.mock("@/hooks/common/useDebounce", () => ({
  useDebounce: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

vi.mock("@/contexts/ConfirmContext", () => ({
  useConfirm: () => vi.fn().mockResolvedValue(true),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import ProfilePage from "@/app/dashboard/profile/page";

afterEach(() => {
  vi.clearAllMocks();
});

describe("이력서 공개 토글", () => {
  it("토글 성공 시 profile.list와 talents 캐시를 모두 무효화한다 (#3)", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    // PUBLIC 상태 → "공개 중" 버튼 클릭 (PRIVATE 전환은 confirm 없이 진행)
    fireEvent.click(screen.getByRole("button", { name: "공개 중" }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledTimes(1);
    });

    const invalidatedKeys = invalidateSpy.mock.calls.map(
      (call) => (call[0] as { queryKey: unknown[] }).queryKey
    );
    expect(invalidatedKeys).toContainEqual(["talents"]);
    expect(invalidatedKeys.some((key) => key[0] === "profile" && key[1] === "list")).toBe(true);
  });
});
