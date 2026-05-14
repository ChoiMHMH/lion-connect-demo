import MemberHeader from "@/components/headers/MemberHeader";
import Footer from "@/components/Footer";
import { dashboardMetadata } from "@/app/(company)/seo/metadata";
import { getInitialDemoRole } from "@/lib/demoAuthServer";
import { DEFAULT_TALENT_DEMO_ROLE } from "@/constants/demoAuth";

export const metadata = dashboardMetadata;

/**
 * 인재용 레이아웃
 * - MemberHeader: 인재 전용 네비게이션
 * - Footer: 공통 푸터
 * - pt-20: Header의 고정 높이만큼 상단 패딩
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialDemoRole = await getInitialDemoRole(DEFAULT_TALENT_DEMO_ROLE);

  return (
    <>
      <MemberHeader initialDemoRole={initialDemoRole} />
      <div className="pt-20">{children}</div>
      <Footer />
    </>
  );
}
