import { resetDemoResumeStore } from "@/lib/demo/resumeStore";
import { resetDemoRoleStore } from "@/lib/demo/roleStore";
import { clearDemoBlobs } from "@/lib/demo/persistence";

/**
 * 데모 모드의 모든 영속 상태를 초기 시드로 되돌린다.
 * - 인메모리 스토어 재빌드 + localStorage(JSON) 제거
 * - IndexedDB 업로드 blob 비우기
 * 데모를 처음 상태로 보고 싶을 때 사용한다(/demo/reset).
 */
export async function resetAllDemoData(): Promise<void> {
  resetDemoResumeStore();
  resetDemoRoleStore();
  await clearDemoBlobs();
}
