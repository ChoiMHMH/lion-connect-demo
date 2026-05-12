# T08 - Resume Mock API Flow

> depends on: T07

## 보장할 동작

인재 이력서 작성/수정 플로우가 기존 API 계층을 통과해 `/api/demo` Route Handler에서 조회/저장되고, dirty/defaultValues 기반 POST/PUT 분기가 유지된다.

## 선행 테스트 / 선행 검증

- `sed -n '1,280p' lib/api/talentRegister.ts`
- `sed -n '1,180p' lib/api/profiles.ts`
- `sed -n '1,180p' lib/api/educations.ts`
- `sed -n '1,180p' lib/api/experiences.ts`
- `sed -n '1,760p' app/dashboard/profile/[profileId]/_actions/submitTalentRegister.ts`
- 기존 `submitTalentRegister` 테스트 패턴 확인

## 작업

- 안전한 mock seed 데이터를 `mocks/demo` 또는 적절한 위치에 추가한다.
- `/api/demo` Route Handler와 mock router/controller를 만든다.
- 이력서 목록/생성/조회/수정 API를 구현한다.
- 학력/경력 GET/POST/PUT/DELETE API를 구현한다.
- custom skills, jobs, exp-tags, profile links, work-driven, awards/languages/certifications의 최소 API를 구현한다.
- thumbnail/portfolio presign과 upload complete는 S3 없이 mock URL을 반환한다.
- 최종 저장 시 `status: COMPLETED`, 임시 저장 시 `status: DRAFT`가 반영되게 한다.

## 완료 기준

- `/dashboard/profile`에서 데모 이력서 목록이 표시된다.
- `/dashboard/profile/1`에서 기존 데모 이력서 데이터가 로드된다.
- 기본 정보, 학력, 경력 수정 후 저장 시 `/api/demo` 호출이 발생한다.
- 신규 학력/경력은 POST 후 id가 부여되고, 이후 저장은 PUT으로 동작한다.
- 마지막 profile update에서 status 전환이 로그로 확인된다.

## 커밋

- `feat: mock resume editing api flow`
