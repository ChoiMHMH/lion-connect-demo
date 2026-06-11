"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/components/buttons/BackButton";
import { JobForm } from "@/components/job/JobForm";
import { useCreateJobPosting } from "@/hooks/company/useJobPosting";
import { useAlert } from "@/contexts/ConfirmContext";
import type { JobFormData } from "@/types/job";

export default function NewJobPage() {
  const router = useRouter();
  const createMutation = useCreateJobPosting();
  const alert = useAlert();

  const handleSubmit = async (data: JobFormData) => {
    try {
      await createMutation.mutateAsync(data);
      await alert({ title: "채용 공고가 등록되었습니다." });
      router.push(`/jobs`);
    } catch (error) {
      console.error("Error creating job:", error);
      await alert({
        title: "채용 공고 등록에 실패했습니다.",
        description: "잠시 후 다시 시도해주세요.",
      });
    }
  };

  return (
    <div className="container w-[1224px] mx-auto p-8">
      <BackButton />
      <div className="mt-8 flex justify-center">
        <JobForm onSubmit={handleSubmit} submitButtonText="채용 공고 등록하기" />
      </div>
    </div>
  );
}
