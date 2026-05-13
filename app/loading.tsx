export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section
        className="flex w-full max-w-[420px] flex-col items-center gap-6 text-center"
        aria-label="LionConnect Demo loading"
      >
        <div className="relative h-16 w-16" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-05" />
          <div className="absolute inset-4 rounded-full bg-brand-05/10" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-title text-2xl font-bold leading-8 text-neutral-900">
            LionConnect Demo를 준비하고 있어요
          </h1>
          <p className="text-sm leading-6 text-neutral-600">
            실제 서버 없이 Mock API로 페이지를 불러오는 중입니다.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2" aria-hidden="true">
          <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
          <div className="mx-auto h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
        </div>
      </section>
    </main>
  );
}
