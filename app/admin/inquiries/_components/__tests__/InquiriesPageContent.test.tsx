import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InquiriesPageContent from "@/app/admin/inquiries/_components/InquiriesPageContent";
import type { Inquiry, InquiryListResponse, InquiryStatus } from "@/types/inquiry";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  useAdminInquiries: vi.fn(),
  useQueryParams: vi.fn(),
  useUpdateInquiryStatus: vi.fn(),
}));

vi.mock("@/hooks/common/useQueryParams", () => ({
  useQueryParams: mocks.useQueryParams,
}));

vi.mock("@/hooks/inquiry/useInquiries", () => ({
  useAdminInquiries: mocks.useAdminInquiries,
  useUpdateInquiryStatus: mocks.useUpdateInquiryStatus,
}));

function inquiry(id: number, status: InquiryStatus): Inquiry {
  return {
    id,
    profileId: id + 100,
    profileName: `프로필 ${id}`,
    profileStorageUrl: "",
    companyName: `회사 ${id}`,
    contactPerson: `담당자 ${id}`,
    department: "인사팀",
    position: "매니저",
    email: `contact-${id}@example.com`,
    phoneNumber: "010-0000-0000",
    content: `문의 ${id}`,
    privacyPolicyAgreed: true,
    status,
    createdAt: "2026-05-14T00:00:00.000Z",
    updatedAt: "2026-05-14T00:00:00.000Z",
  };
}

function response(content: Inquiry[]): InquiryListResponse {
  return {
    totalPages: 1,
    totalElements: content.length,
    first: true,
    last: true,
    size: 10,
    content,
    number: 0,
    sort: { empty: false, sorted: true, unsorted: false },
    numberOfElements: content.length,
    pageable: {
      offset: 0,
      sort: { empty: false, sorted: true, unsorted: false },
      paged: true,
      pageNumber: 0,
      pageSize: 10,
      unpaged: false,
    },
    empty: content.length === 0,
  };
}

describe("InquiriesPageContent", () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
    mocks.useQueryParams.mockReturnValue({ params: {} });
    mocks.useUpdateInquiryStatus.mockReturnValue({
      mutate: mocks.mutate,
      isPending: false,
      variables: undefined,
    });
  });

  it("NEW 또는 IN_PROGRESS 행 클릭 시 DONE 상태 업데이트 mutation을 호출한다", async () => {
    const user = userEvent.setup();
    mocks.useAdminInquiries.mockReturnValue({
      data: response([inquiry(1, "NEW"), inquiry(2, "IN_PROGRESS")]),
      isLoading: false,
      error: null,
    });

    render(<InquiriesPageContent />);

    await user.click(screen.getByText("담당자 1").closest("div")!);
    await user.click(screen.getByText("담당자 2").closest("div")!);

    expect(mocks.mutate).toHaveBeenNthCalledWith(1, { id: 1, status: "DONE" });
    expect(mocks.mutate).toHaveBeenNthCalledWith(2, { id: 2, status: "DONE" });
  });

  it("DONE 행 클릭 시 상태 업데이트 mutation을 호출하지 않는다", async () => {
    const user = userEvent.setup();
    mocks.useAdminInquiries.mockReturnValue({
      data: response([inquiry(3, "DONE")]),
      isLoading: false,
      error: null,
    });

    render(<InquiriesPageContent />);

    await user.click(screen.getByText("담당자 3").closest("div")!);

    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
