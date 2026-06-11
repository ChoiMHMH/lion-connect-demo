import { describe, expect, it, vi } from "vitest";
import { invalidateTalentPreviewQueries } from "@/hooks/talent/queries/invalidateTalentPreviewQueries";

describe("invalidateTalentPreviewQueries", () => {
  it("인재 목록과 상세 query 캐시를 제거한 뒤 무효화한다", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
      removeQueries: vi.fn(),
    };

    await invalidateTalentPreviewQueries(queryClient, 1);

    expect(queryClient.removeQueries).toHaveBeenCalledTimes(2);
    expect(queryClient.removeQueries).toHaveBeenNthCalledWith(1, { queryKey: ["talents"] });
    expect(queryClient.removeQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["talent", "detail", "1"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ["talents"] });
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["talent", "detail", "1"],
    });
  });
});
