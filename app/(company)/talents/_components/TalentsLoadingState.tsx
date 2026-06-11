import IntroduceCardSkeleton from "./IntroduceCardSkeleton";

/**
 * 인재탐색 첫 페인트용 로딩 상태.
 * - Suspense fallback과 데이터 로딩(isLoading) 양쪽에서 동일 레이아웃을 재사용한다.
 * - useSearchParams 등 라우터 훅에 의존하지 않아 Suspense fallback에서 재서스펜드되지 않는다.
 * - min-h-screen으로 콘텐츠 높이를 예약해 Footer가 먼저 떴다가 밀리는 점프(#1)를 막는다.
 */
export default function TalentsLoadingState() {
  return (
    <main data-testid="talents-loading" className="w-full text-black mt-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8 space-y-4">
          {/* 검색/필터 헤더 자리 (정적 스켈레톤) */}
          <div className="w-full" aria-hidden>
            <div className="flex w-full h-14 gap-3">
              <div className="flex-1 rounded-xl bg-neutral-200 animate-pulse" />
              <div className="w-20 rounded-xl bg-neutral-200 animate-pulse" />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-10 w-72 rounded-lg bg-neutral-200 animate-pulse" />
              <div className="h-5 w-20 rounded bg-neutral-200 animate-pulse" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <IntroduceCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
