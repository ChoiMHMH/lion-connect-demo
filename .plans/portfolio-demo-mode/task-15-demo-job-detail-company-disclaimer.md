# T15 - Demo Job Detail Company Disclaimer

> depends on: T14

## 무엇을 / 왜

인재 데모 채용공고 상세 하단 저작권/면책 문구에 고정 placeholder `회사 이름`이 노출되지 않도록 실제 공고의 회사명을 표시한다.

## 현재 상태

- `/dashboard/job-board/[jobId]` 상세 화면은 `job.companyName`으로 상단 회사명을 표시한다.
- 하단 `JobCopyright` 컴포넌트는 회사명을 prop으로 받지 않고 `회사 이름` 문자열을 고정 렌더링한다.

## 선택한 해결책

- `JobCopyright`가 `companyName` prop을 받도록 변경한다.
- 채용 상세 페이지에서 `job.companyName || "회사"` 값을 전달한다.
- 컴포넌트 테스트로 실제 회사명이 표시되고 placeholder가 남지 않는지 확인한다.

## 대안

- 대안: `JobCopyright` 내부에서 임의 기본 데모 회사명을 하드코딩한다.
- 기각 이유: 상세 공고마다 회사명이 달라져야 하며, 이미 상위 페이지가 실제 공고 데이터를 갖고 있다.

## 검증

- `JobCopyright` 렌더링 테스트
- `npm run type-check`
- `npm run lint`

## 커밋

- `fix: show company name in job detail disclaimer`
