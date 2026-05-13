import Link from "next/link";
import DemoResetButton from "@/app/demo/_components/DemoResetButton";
import { DEMO_ROUTE_SECTIONS } from "@/constants/demoRoutes";

const roleSummaries = {
  demo_talent: {
    title: "인재 데모",
    description: "채용 탐색, 이력서 작성/수정, 지원 현황을 인재 role로 확인합니다.",
    highlight: "이력서 저장 플로우",
  },
  demo_company: {
    title: "기업 데모",
    description: "인재 탐색, 채용공고 등록, 지원자 확인 흐름을 기업 role로 확인합니다.",
    highlight: "기업용 보호 라우트",
  },
  demo_admin: {
    title: "관리자 데모",
    description: "사용자, 기업, 지원 현황, 문의 목록을 관리자 role로 확인합니다.",
    highlight: "RBAC 관리자 화면",
  },
} as const;

const policyCards = [
  {
    title: "운영 서버 종료",
    body: "실제 로그인, 회원가입, 운영 API 서버는 호출하지 않습니다. CTA는 데모 허브 또는 안내 모달로 연결됩니다.",
  },
  {
    title: "Mock API",
    body: "핵심 화면은 기존 domain API와 apiClient 계층을 통과한 뒤 /api/demo Route Handler에서 응답받도록 확장됩니다.",
  },
  {
    title: "저장 정책",
    body: "외부 DB를 사용하지 않습니다. 데모 상태는 브라우저 localStorage 또는 서버 메모리 안에서만 유지됩니다.",
  },
  {
    title: "이미지 정책",
    body: "실제 인물 사진이나 기업 로고를 새로 추가하지 않고, placeholder와 initials 기반 UI를 사용합니다.",
  },
];

export default function DemoHubPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-brand-05">LionConnect Demo</p>
            <h1 className="font-title text-4xl font-bold leading-tight text-neutral-950">
              포트폴리오 검토용 데모 허브
            </h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-600">
              LionConnect 운영 서버가 종료되어 실제 인증과 운영 DB 없이 핵심 역할별 흐름을 둘러볼 수
              있도록 구성한 데모 모드입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo/dev-notes"
              className="rounded-md bg-brand-05 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-06"
            >
              기술 노트 보기
            </Link>
            <Link
              href="/demo/enter/talent?returnTo=/dashboard/profile/1"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
            >
              이력서 저장 플로우 체험하기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-10 md:grid-cols-3">
        {DEMO_ROUTE_SECTIONS.map((section) => {
          const summary = roleSummaries[section.role];

          return (
            <article
              key={section.role}
              className="flex min-h-[280px] flex-col justify-between rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-orange-50 text-sm font-bold text-brand-06">
                  {summary.title.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-05">
                    {summary.highlight}
                  </p>
                  <h2 className="mt-2 font-title text-2xl font-bold text-neutral-950">
                    {summary.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{summary.description}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={section.entryHref}
                  className="rounded-md bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  {summary.title} 시작
                </Link>
                <div className="flex flex-wrap gap-2">
                  {section.links.slice(0, 3).map((link) => (
                    <Link
                      key={link.href}
                      href={`/demo/enter/${section.role.replace("demo_", "")}?returnTo=${encodeURIComponent(
                        link.href
                      )}`}
                      className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:border-brand-05 hover:text-brand-06"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-6 pb-12 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-title text-xl font-bold text-neutral-950">데모 동작 정책</h2>
          <div className="mt-5 grid gap-4">
            {policyCards.map((card) => (
              <div key={card.title} className="border-l-2 border-brand-05 pl-4">
                <h3 className="text-sm font-bold text-neutral-900">{card.title}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-title text-xl font-bold text-neutral-950">초기화</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            검토 중 선택한 데모 role, 안내 모달 표시 여부, 이후 추가될 데모 API 로그와 이력서 mock
            저장 데이터를 브라우저에서 정리합니다.
          </p>
          <div className="mt-5">
            <DemoResetButton />
          </div>
        </div>
      </section>
    </main>
  );
}
