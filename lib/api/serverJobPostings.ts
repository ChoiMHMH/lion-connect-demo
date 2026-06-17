import { API_ENDPOINTS } from "@/constants/api";
import { serverGet } from "@/lib/serverApiClient";
import { withQuery } from "@/lib/http/query";
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
  const endpoint = withQuery(API_ENDPOINTS.JOB_POSTINGS.LIST, {
    jobGroupCode: params.jobGroupCode || undefined,
    jobRoleCode: params.jobRoleCode || undefined,
    page: params.page,
    size: params.size,
    sort: params.sort,
  });
  return serverGet<PublicJobPostingsResponse>(endpoint);
}
