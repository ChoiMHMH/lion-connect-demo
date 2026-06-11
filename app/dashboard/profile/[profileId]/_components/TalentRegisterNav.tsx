"use client";

import { cn } from "@/utils/utils";
import { useToastStore } from "@/store/toastStore";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { talentRegisterTempSaveSchema } from "@/schemas/talent/talentRegisterSchema";
import { useRef } from "react";

interface TalentRegisterNavProps extends React.HTMLAttributes<HTMLElement> {
  onTempSave?: () => void;
  onSubmit?: () => void;
  formId?: string;
  isSubmitDisabled?: boolean;
  /** 작성 완료(최종 제출) 진행 중 여부 */
  isSubmitting?: boolean;
  /** 임시 저장 진행 중 여부 */
  isTempSaving?: boolean;
}

export default function TalentRegisterNav({
  onTempSave,
  onSubmit,
  formId,
  isSubmitDisabled = false,
  isSubmitting = false,
  isTempSaving = false,
  className,
  ...props
}: TalentRegisterNavProps) {
  const { showToast } = useToastStore();
  const router = useRouter();
  const { register, getValues } = useFormContext();

  // Debounce를 위한 ref
  const tempSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 제출 또는 임시 저장이 진행 중이면 두 버튼 모두 비활성화하여 중복 요청 방지
  const isBusy = isSubmitting || isTempSaving;
  const isSubmitButtonDisabled = isSubmitDisabled || isBusy;

  const handleGoBack = () => {
    router.push("/profile");
  };

  const handleTempSave = async () => {
    if (onTempSave) {
      // 이미 대기 중인 타이머가 있으면 취소
      if (tempSaveTimerRef.current) {
        clearTimeout(tempSaveTimerRef.current);
      }

      // 1초 후 실행되도록 타이머 설정
      tempSaveTimerRef.current = setTimeout(async () => {
        // 임시저장 전 검증 수행
        const currentValues = getValues();
        const validationResult = talentRegisterTempSaveSchema.safeParse(currentValues);

        if (!validationResult.success) {
          // 첫 번째 에러 메시지 표시
          const firstError = validationResult.error.issues[0];
          showToast(firstError.message, "error");
          return;
        }

        await onTempSave();
      }, 1000);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-24 z-40 max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between mt-8",
        "bg-bg-page/95 backdrop-blur supports-[backdrop-filter]:bg-bg-page/80",
        className
      )}
      {...props}
    >
      {/* 왼쪽: 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={handleGoBack}
        className="flex cursor-pointer items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity"
      >
        <span className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 7L9 12L14 17"
              stroke="currentColor"
              className="text-icon-secondary"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-base md:text-lg font-bold text-text-primary">이전 페이지</span>
      </button>

      {/* 중앙: 편집 가능한 페이지 제목 */}
      <input
        type="text"
        {...register("profile.title")}
        placeholder="이력서 제목"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-bold text-text-primary",
          "text-center bg-transparent border-2 border-transparent rounded px-3 py-1",
          "hover:border-accent focus:border-accent focus:outline-none",
          "transition-colors duration-200",
          "min-w-[200px] max-w-[400px]"
        )}
      />

      {/* 오른쪽: 임시 저장 + 작성 완료 버튼 */}
      <div className="flex items-center gap-2 md:gap-3">
        {onTempSave && (
          <button
            type="button"
            onClick={handleTempSave}
            disabled={isBusy}
            className={cn(
              "px-4 py-2.5 md:py-3 border rounded-lg text-base md:text-lg font-bold transition-colors",
              isBusy
                ? "border-border-quaternary bg-bg-tertiary text-text-quaternary cursor-not-allowed"
                : "border-border-accent bg-bg-primary text-text-accent hover:bg-bg-secondary hover:cursor-pointer"
            )}
          >
            {isTempSaving ? "저장 중..." : "임시 저장"}
          </button>
        )}
        <button
          type={formId ? "submit" : "button"}
          form={formId}
          onClick={!formId ? onSubmit : undefined}
          disabled={isSubmitButtonDisabled}
          className={cn(
            "px-4 py-2.5 md:py-3 rounded-lg text-base md:text-lg font-bold transition-colors",
            isSubmitButtonDisabled
              ? "bg-bg-tertiary text-text-quaternary outline-1 outline-border-quaternary -outline-offset-1 cursor-not-allowed"
              : "bg-bg-accent text-text-inverse-primary hover:bg-brand-06 cursor-pointer"
          )}
        >
          {isSubmitting ? "저장 중..." : "작성 완료"}
        </button>
      </div>
    </nav>
  );
}
