# T10 - Docs, Env, Assets Policy

> depends on: T06, T08, T09

## 보장할 동작

README와 안전한 환경 예시가 데모의 한계와 검토 방법을 명확히 설명하고, 이미지/자산 정책이 public repo에 안전하게 남는다.

## 선행 테스트 / 선행 검증

- `sed -n '1,260p' README.md`
- `find . -maxdepth 2 -name '.env*' -print`
- `find public -maxdepth 3 -type f | sort`

## 작업

- README 상단에 포트폴리오 데모 모드 안내를 추가한다.
- 실제 서버/개인정보/민감정보/실제 로그인/서버 저장이 없다는 점을 명확히 쓴다.
- Mock API, RBAC, API 호출 계층, 이력서 저장 흐름 확인 방법을 정리한다.
- localStorage/메모리 저장 정책과 데이터 초기화 방법을 정리한다.
- 필요한 이미지 placeholder 경로와 권장 사이즈를 정리한다.
- 필요 시 `.env.example`에 `NEXT_PUBLIC_DEMO_MODE=true` 등 안전한 demo 값만 추가한다.
- 실제 서버 주소, 실제 토큰, 민감정보는 추가하지 않는다.

## 완료 기준

- README 첫 화면에서 이 저장소가 포트폴리오 데모 아카이브임을 알 수 있다.
- `public/demo/assets/talent-avatar.png`, `public/demo/assets/company-logo.png`, `public/demo/loading.gif` 같은 선택 경로와 권장 사이즈가 문서화된다.
- 새 외부 이미지나 실제 기업 로고가 추가되지 않는다.

## 커밋

- `docs: document portfolio demo mode`
