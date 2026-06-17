/**
 * 기업 문의 관리 API
 */

import { get, patch, post } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api";
import { withQuery } from "@/lib/http/query";
import type {
  InquiryListParams,
  InquiryListResponse,
  UpdateInquiryStatusRequest,
  CreateInquiryRequest,
} from "@/types/inquiry";

/**
 * 기업 문의 목록 조회
 * GET /api/admin/inquiries
 *
 * @param params 조회 파라미터
 * @returns 페이지네이션된 문의 목록
 */
export async function getAdminInquiries(
  params: InquiryListParams = {}
): Promise<InquiryListResponse> {
  const endpoint = withQuery(API_ENDPOINTS.ADMIN.INQUIRIES.LIST, {
    status: params.status || undefined,
    profileId: params.profileId,
    profileName: params.profileName || undefined,
    receivedFrom: params.receivedFrom || undefined,
    receivedTo: params.receivedTo || undefined,
    page: params.page,
    size: params.size,
    sort: params.sort,
  });

  return get<InquiryListResponse>(endpoint);
}

/**
 * 기업 문의 제출
 * POST /api/inquiries
 *
 * @param data 문의 데이터
 */
export async function createInquiry(data: CreateInquiryRequest): Promise<void> {
  return post<void>(API_ENDPOINTS.INQUIRIES.CREATE, data, {
    skipAuth: true, // 인증 불필요 (Authorization 헤더 제외)
    skipCredentials: true, // 쿠키 포함 안 함
  });
}

/**
 * 문의 상태 업데이트
 * PATCH /api/admin/inquiries/{id}/status
 *
 * @param id 문의 ID
 * @param data 상태 업데이트 데이터
 */
export async function updateInquiryStatus(
  id: number,
  data: UpdateInquiryStatusRequest
): Promise<void> {
  return patch<void>(API_ENDPOINTS.ADMIN.INQUIRIES.UPDATE_STATUS(id), data);
}
