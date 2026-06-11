import { JobListHeader } from "./JobListHeader";
import { JobCardSkeleton } from "./JobCardSkeleton";

/**
 * 채용공고 관리 첫 페인트용 로딩 상태.
 * - Suspense fallback과 데이터 로딩(isLoading) 양쪽에서 동일 레이아웃을 재사용한다.
 * - useSearchParams 등 라우터 훅에 의존하지 않아 Suspense fallback에서 재서스펜드되지 않는다.
 * - min-h-screen으로 콘텐츠 높이를 예약해 Footer가 먼저 떴다가 밀리는 점프를 막는다(/talents와 동일).
 */
export function JobsLoadingState() {
  return (
    <div
      data-testid="jobs-loading"
      className="container flex flex-col gap-16 w-[1158px] mx-auto p-[72px] min-h-screen"
    >
      <JobListHeader />
      <div className="w-full inline-flex flex-col justify-start items-start gap-16">
        {Array.from({ length: 3 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
