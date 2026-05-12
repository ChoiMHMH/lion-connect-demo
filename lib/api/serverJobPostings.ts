import { API_ENDPOINTS } from "@/constants/api";
import { serverGet } from "@/lib/serverApiClient";
import type {
  PublicJobPostingsParams,
  PublicJobPostingsResponse,
} from "@/types/company-job-posting";
import type { JobDetailResponse } from "@/types/job";

/**
 * 공개 채용 공고 상세 조회 API (Server Component 전용)
 */
export function fetchPublicJobPostingServer(jobId: string): Promise<JobDetailResponse> {
  return serverGet<JobDetailResponse>(API_ENDPOINTS.JOB_POSTINGS.GET(jobId));
}

/**
 * 공개 채용 공고 목록 조회 API (Server Component/Metadata Route 전용)
 */
export function fetchPublicJobPostingsServer(
  params: PublicJobPostingsParams
): Promise<PublicJobPostingsResponse> {
  const queryParams = new URLSearchParams();

  if (params.jobGroupCode) {
    queryParams.append("jobGroupCode", params.jobGroupCode);
  }
  if (params.jobRoleCode) {
    queryParams.append("jobRoleCode", params.jobRoleCode);
  }
  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.size !== undefined) {
    queryParams.append("size", params.size.toString());
  }
  if (params.sort && params.sort.length > 0) {
    params.sort.forEach((s) => queryParams.append("sort", s));
  }

  const endpoint = `${API_ENDPOINTS.JOB_POSTINGS.LIST}?${queryParams.toString()}`;
  return serverGet<PublicJobPostingsResponse>(endpoint);
}
