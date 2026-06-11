"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { JobSelector } from "@/components/ui/job-selector";
import { JobList } from "./job-board/_components/JobList";
import { fetchPublicJobPostings } from "@/lib/api/jobPostings";
import { findJobGroupById, findJobRoleById } from "@/constants/jobMapping";

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 필터/페이지 상태는 URL 쿼리에서 읽는다 (새로고침·공유·뒤로가기 시 유지).
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const selectedJobGroupId = searchParams.get("jobGroupId") ?? "";
  const selectedJobRoleId = searchParams.get("jobRoleId") ?? "";

  // ID를 code로 변환
  const jobGroupCode = selectedJobGroupId
    ? findJobGroupById(Number(selectedJobGroupId))?.code
    : undefined;
  const jobRoleCode = selectedJobRoleId
    ? findJobRoleById(Number(selectedJobRoleId))?.role.code
    : undefined;

  // 채용공고 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["publicJobPostings", jobGroupCode, jobRoleCode, pageFromUrl],
    queryFn: () =>
      fetchPublicJobPostings({
        jobGroupCode,
        jobRoleCode,
        page: pageFromUrl - 1, // API는 0-based, UI는 1-based
        size: 12,
      }),
  });

  // 필터 변경 시 URL 쿼리를 갱신한다. 필터가 바뀌면 항상 1페이지로 초기화.
  const pushQuery = (next: { jobGroupId?: string; jobRoleId?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if ("jobGroupId" in next) {
      if (next.jobGroupId) params.set("jobGroupId", next.jobGroupId);
      else params.delete("jobGroupId");
    }
    if ("jobRoleId" in next) {
      if (next.jobRoleId) params.set("jobRoleId", next.jobRoleId);
      else params.delete("jobRoleId");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleJobGroupChange = (jobGroupId: string) => {
    // 직군 변경 시 직무 초기화
    pushQuery({ jobGroupId, jobRoleId: "" });
  };

  const handleJobRoleChange = (jobRoleId: string) => {
    pushQuery({ jobRoleId });
  };

  return (
    <div className="container mx-auto pt-[80px] pb-[90px]">
      <h1 className="sr-only">라이언 커넥트 인재 대시보드</h1>
      <div className="w-[1160px] mx-auto">
        <JobSelector
          selectedJobGroupId={selectedJobGroupId}
          selectedJobRoleId={selectedJobRoleId}
          onJobGroupChange={handleJobGroupChange}
          onJobRoleChange={handleJobRoleChange}
        />
        <JobList data={data} isLoading={isLoading} error={error} currentPage={pageFromUrl} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto pt-[80px] pb-[90px] min-h-screen" />}>
      <DashboardContent />
    </Suspense>
  );
}
