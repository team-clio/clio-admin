# Clio Server API 연동에 따른 화면 변경

이 문서는 `../clio-server`의 현재 API 계약을 기준으로 Admin 화면에서 변경된 부분을 기록한다.

## 공통 및 프로젝트

- 프로젝트 ID 타입을 프런트의 `string`에서 서버의 `Long`에 대응하는 `number`로 변경했다.
- 선택한 프로젝트 ID를 버그 리포트와 이슈 화면에 전달하도록 변경했다.
- 개발 프록시에 `/external-api`와 `/internal-api`를 추가하고 잘못된 `/internal/api` 경로를 제거했다.
- 서버 오류 응답의 `message`를 공통으로 표시하는 API 클라이언트를 추가했다.

## 버그 리포트 화면

- mock 리포트를 제거하고 `GET /external-api/v1/projects/{projectId}/bugs` 결과를 표시한다.
- 서버의 페이지 응답(`items`, `page`, `totalElements`, `totalPages`)에 맞춰 이전/다음 페이지 이동을 연결했다.
- 서버 enum을 다음과 같이 화면 표시값으로 변환한다.
  - 상태: `NEW`, `ANALYZING`, `TRIAGED`, `RESOLVED`, `IGNORED`
  - 심각도: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - 소스: `API`, `SENTRY`, `LOG`, `MANUAL`, `IN_APP_WIDGET`, `CUSTOMER_SUPPORT`, `EMAIL`, `SLACK`
- 서버 목록 응답에 없는 제보자, 사용자 원문, 실행 환경, 재현 단계는 화면에서 제거했다.
- 상세 패널은 API가 제공하는 오류 유형, 최상위 스택 프레임, 발생 시각, 연결 이슈만 표시한다.
- 대시보드 수치는 서버에서 정확히 계산 가능한 전체 개수와 현재 페이지의 상태/연결 집계로 변경했다.

## 이슈 화면

- mock 이슈를 제거하고 다음 API를 연결했다.
  - 목록: `GET /external-api/v1/projects/{projectId}/issues`
  - 상세: `GET /external-api/v1/projects/{projectId}/issues/{issueId}`
  - 통계: `GET /external-api/v1/projects/{projectId}/issues/stats`
	- 상태 변경: `PATCH /external-api/v1/projects/{projectId}/issues/{issueId}`
	- 최신 AI 분석: `GET /external-api/v1/projects/{projectId}/issues/{issueId}/analysis-results/latest`
- 상세 화면의 고정 재현 조건과 고정 설명을 제거하고 서버가 반환하는 연결 버그 목록을 표시한다.
- `OPEN → IN_PROGRESS → RESOLVED` 상태 변경과 해결된 이슈 다시 열기를 실제 API에 연결했다.
	- 우선순위를 서버 계약인 `P0`부터 `P4`까지 표시하도록 확장했다.
	- 상세 패널에서 분석 상태, 신뢰도, 원인 가설, 코드 근거, 해결 계획과 검토 경고를 표시한다.

## 시스템 설정 화면

- LLM 설정 조회 API를 호출하도록 연결했지만 현재 서버가 모든 관련 요청에 `501 Not Implemented`를 반환한다.
- 저장된 것처럼 보이던 가짜 성공 동작과 샘플 API 키를 제거했다.
- 관리자 계정 API가 서버에 없으므로 동작하지 않는 계정 수정 폼을 제거하고 미지원 상태를 표시한다.

## MCP 화면

- 서버에 API 키 발급·조회·재발급 API와 실제 MCP 패키지 계약이 없으므로 가짜 설치 명령과 “연결 준비 완료” 표시를 제거했다.
- 현재 구현 전 상태와 예정 도구만 표시한다.

## PCM 메모리 화면

- 에이전트 PCM 컨텍스트 메모리를 조회하는 화면을 추가했다.
  - 스냅샷: `GET /external-api/v1/pcm/projects/{projectId}/snapshot`
  - 목록: `GET /external-api/v1/pcm/projects/{projectId}/knowledge`
  - 상세: `GET /external-api/v1/pcm/projects/{projectId}/knowledge/{knowledgeId}`
- 세 엔드포인트 모두 Spring 중계 API가 에이전트 JSON을 그대로 통과시키므로
  화면은 스냅샷 revision, 지식 문서 목록, 본문·출처·관련 문서만 표시한다.
- tombstone 문서는 목록에 배지로 표시하고, 목록의 문서를 선택하면 상세 API를 호출한다.

## 서버 측 추가 구현이 필요한 항목

- 버그 원문·제보자·실행 환경·재현 단계 조회 API
- 버그 상세 조회용 external API
- 리포트 대시보드 전용 집계 API
- LLM Provider/모델 조회·수정 및 연결 테스트 구현
- 관리자 계정 조회·수정 API
- MCP API 키 관리 API와 배포 가능한 MCP 서버 패키지
