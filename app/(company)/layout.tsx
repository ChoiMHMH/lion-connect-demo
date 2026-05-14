import CompanyHeader from "@/components/headers/CompanyHeader";
import Footer from "@/components/Footer";
import { getInitialDemoRole } from "@/lib/demoAuthServer";

/**
 * 기업용 레이아웃
 * - CompanyHeader: 기업 전용 네비게이션
 * - Footer: 공통 푸터
 * - pt-20: Header의 고정 높이만큼 상단 패딩
 */
export default async function CompanyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialDemoRole = await getInitialDemoRole();

  return (
    <>
      <CompanyHeader initialDemoRole={initialDemoRole} />
      <div className="pt-20">{children}</div>
      <Footer />
    </>
  );
}
