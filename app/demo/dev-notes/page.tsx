import Link from "next/link";

const apiFlow = [
  "ResumeForm",
  "useMutation",
  "domain API",
  "apiClient",
  "endpoint constants",
  "/api/demo Route Handler",
  "mock DB/localStorage",
];

const notes = [
  {
    title: "인증과 RBAC",
    body: "데모 role 진입은 실제 로그인 요청을 만들지 않고 demo accessToken, demo user, user-roles 쿠키를 함께 설정해 기존 middleware 보호 라우트를 통과합니다.",
  },
  {
    title: "API 계층 보존",
    body: "컴포넌트가 mock 데이터를 직접 import하지 않습니다. 기존 hook/query/mutation과 domain API를 그대로 거친 뒤 demo base URL만 /api/demo로 바꾸는 구조를 목표로 합니다.",
  },
  {
    title: "이력서 저장 흐름",
    body: "기본 정보, 학력, 경력 등 섹션 저장은 기존 POST/PUT/PATCH 호출 순서를 유지하고, 마지막 profile status 전환까지 Route Handler mock 응답으로 확인합니다.",
  },
  {
    title: "저장 범위",
    body: "외부 DB, Firebase, Supabase, 실제 운영 서버 저장소를 쓰지 않습니다. 새로고침 유지가 필요한 값은 localStorage, 요청 단위 mock 상태는 메모리에 둡니다.",
  },
  {
    title: "이미지와 데이터",
    body: "실제 사용자 정보, 실제 토큰, 출처 불명 이미지, 실제 기업 로고를 추가하지 않습니다. 데모 자산은 placeholder 또는 initials UI로 제한합니다.",
  },
];

export default function DemoDevNotesPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-12">
          <Link href="/demo" className="w-fit text-sm font-semibold text-brand-06 hover:underline">
            데모 허브로 돌아가기
          </Link>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-brand-05">Implementation Notes</p>
            <h1 className="font-title text-4xl font-bold leading-tight text-neutral-950">
              데모 모드 기술 노트
            </h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-600">
              포트폴리오 검토자가 서버 없이도 기존 프론트엔드 설계의 인증, 라우팅, API 계층, 이력서
              저장 흐름을 확인할 수 있도록 고정한 구현 계약입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10">
        <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-title text-2xl font-bold text-neutral-950">API 호출 흐름</h2>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {apiFlow.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-md border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-semibold text-neutral-800">
                  {step}
                </span>
                {index < apiFlow.length - 1 ? (
                  <span className="text-sm font-semibold text-neutral-400">-&gt;</span>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-neutral-600">
            이 흐름은 mock 데이터를 UI에 직접 꽂지 않기 위한 기준입니다. 이후 API base 분기와 Route
            Handler mock은 이 경로를 유지하는지 테스트로 확인합니다.
          </p>
        </article>

        <div className="grid gap-5 md:grid-cols-2">
          {notes.map((note) => (
            <article
              key={note.title}
              className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-title text-xl font-bold text-neutral-950">{note.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{note.body}</p>
            </article>
          ))}
        </div>

        <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-title text-xl font-bold text-neutral-950">검토용 진입점</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            이력서 저장 플로우는 인재 role을 설정한 뒤 동적 이력서 수정 화면으로 이동해 확인합니다.
            실제 DB에 저장되지 않으며, 데모 mock 저장소만 갱신됩니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/demo/enter/talent?returnTo=/dashboard/profile/1"
              className="rounded-md bg-brand-05 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-06"
            >
              이력서 저장 플로우 체험하기
            </Link>
            <Link
              href="/demo/enter/company"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
            >
              기업 데모로 이동
            </Link>
            <Link
              href="/demo/enter/admin"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
            >
              관리자 데모로 이동
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
