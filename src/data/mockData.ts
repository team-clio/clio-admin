export type ReportStatus = '분류 완료' | '분석 중' | '새 리포트'
export type Severity = '긴급' | '높음' | '보통' | '낮음'
export interface Report { id: string; title: string; source: string; user: string; issue: string; received: string; status: ReportStatus; severity: Severity }
export interface ReportDetail { description: string; environment: string; steps: string[] }
export type IssuePriority = 'P0' | 'P1' | 'P2'
export interface Issue { id: string; title: string; summary: string; priority: IssuePriority; reports: number; owner: string; updated: string; confidence: number; state: string }
export interface Provider { id: 'openai' | 'deepseek' | 'gemini'; name: string; model: string; mark: string; color: string }

export const reports: Report[] = [
  { id: 'BR-2481', title: '결제 완료 후 주문 목록에 반영되지 않아요', source: '인앱 위젯', user: '김민서', issue: 'ISS-142', received: '3분 전', status: '분류 완료', severity: '높음' },
  { id: 'BR-2480', title: 'iOS에서 소셜 로그인 버튼이 동작하지 않습니다', source: '고객센터', user: '이준호', issue: 'ISS-138', received: '18분 전', status: '분석 중', severity: '긴급' },
  { id: 'BR-2479', title: '대시보드 날짜 필터 선택값이 초기화됩니다', source: '이메일', user: '박서연', issue: 'ISS-140', received: '41분 전', status: '분류 완료', severity: '보통' },
  { id: 'BR-2478', title: '초대 메일의 워크스페이스 링크가 404를 반환해요', source: '인앱 위젯', user: '최유진', issue: 'ISS-136', received: '1시간 전', status: '분류 완료', severity: '높음' },
  { id: 'BR-2477', title: 'CSV 내보내기 시 한글이 깨져서 표시됩니다', source: 'Slack', user: '정도현', issue: 'ISS-141', received: '2시간 전', status: '새 리포트', severity: '낮음' },
  { id: 'BR-2476', title: '알림 설정을 꺼도 매일 요약 메일이 전송돼요', source: '고객센터', user: '한지우', issue: 'ISS-139', received: '3시간 전', status: '분류 완료', severity: '보통' },
]

export const reportDetails: Record<Report['id'], ReportDetail> = {
  'BR-2481': { description: '결제는 정상적으로 완료되었고 카드 승인 문자도 받았습니다. 하지만 앱의 주문 목록에는 새 주문이 보이지 않습니다. 앱을 종료하고 다시 실행해도 동일해요.', environment: 'iPhone 15 Pro · iOS 17.5 · App 3.12.0', steps: ['상품을 장바구니에 담고 결제를 진행', '카드 결제 승인 완료 화면 확인', '주문 목록으로 이동하면 새 주문이 표시되지 않음'] },
  'BR-2480': { description: '애플 로그인과 카카오 로그인 모두 인증 화면까지는 열리는데, 인증을 마친 뒤 앱으로 돌아오면 계속 로딩 화면만 표시됩니다.', environment: 'iPhone 14 · iOS 17.4 · App 3.12.0', steps: ['로그인 화면에서 소셜 로그인 선택', '외부 인증 화면에서 로그인 완료', '앱 복귀 후 로딩 상태가 종료되지 않음'] },
  'BR-2479': { description: '대시보드에서 최근 30일로 기간을 바꾼 뒤 상세 페이지에 들어갔다가 돌아오면 다시 최근 7일로 초기화됩니다.', environment: 'Chrome 126 · macOS 14.5 · Web', steps: ['대시보드 기간을 최근 30일로 변경', '목록에서 상세 페이지로 이동', '뒤로 이동하면 기간이 최근 7일로 변경됨'] },
  'BR-2478': { description: '팀원이 보낸 워크스페이스 초대 메일에서 참여 버튼을 누르면 404 페이지가 나타나고 워크스페이스에 들어갈 수 없습니다.', environment: 'Safari 17.5 · macOS 14.5 · Web', steps: ['워크스페이스 초대 메일 수신', '워크스페이스 참여 버튼 클릭', '404 오류 페이지 확인'] },
  'BR-2477': { description: '리포트를 CSV로 내려받으면 숫자는 정상인데 한글로 된 고객명과 메모가 모두 깨진 문자로 표시됩니다.', environment: 'Excel 365 · Windows 11 · Web', steps: ['리포트 화면에서 CSV 내보내기', '다운로드된 파일을 Excel에서 열기', '한글 데이터가 깨져서 표시됨'] },
  'BR-2476': { description: '설정에서 일일 요약 이메일을 껐지만 다음 날에도 오전 9시에 요약 메일이 도착했습니다.', environment: 'Chrome 126 · Windows 11 · Web', steps: ['알림 설정에서 일일 요약 이메일 해제', '설정이 저장되었다는 메시지 확인', '다음 날에도 요약 이메일 수신'] },
}

export const issues: Issue[] = [
  { id: 'ISS-138', title: 'iOS 환경에서 소셜 로그인 요청이 완료되지 않음', summary: 'iOS 17.4 이상에서 OAuth 콜백 이후 앱으로 복귀하지 못하는 현상', priority: 'P0', reports: 18, owner: '미지정', updated: '8분 전', confidence: 96, state: '대기' },
  { id: 'ISS-142', title: '결제 성공 이벤트와 주문 상태 간 동기화 지연', summary: '결제는 완료되었으나 주문 목록이 최대 20분 뒤 갱신되는 현상', priority: 'P1', reports: 12, owner: '김지훈', updated: '14분 전', confidence: 94, state: '진행 중' },
  { id: 'ISS-136', title: '워크스페이스 초대 URL 라우팅 오류', summary: '초대 메일 내 딥링크에 잘못된 workspace slug가 포함됨', priority: 'P1', reports: 8, owner: '이소연', updated: '1시간 전', confidence: 91, state: '대기' },
  { id: 'ISS-140', title: '대시보드 기간 필터 상태가 유지되지 않음', summary: '페이지 이동 후 돌아오면 사용자가 선택한 기간이 기본값으로 변경됨', priority: 'P2', reports: 6, owner: '박준영', updated: '2시간 전', confidence: 88, state: '진행 중' },
  { id: 'ISS-139', title: '이메일 알림 수신 설정 미적용', summary: '알림 해제 후에도 일일 다이제스트 예약 작업이 계속 실행됨', priority: 'P2', reports: 4, owner: '미지정', updated: '4시간 전', confidence: 86, state: '대기' },
]

export const providers: Provider[] = [
  { id: 'openai', name: 'OpenAI', model: 'GPT-5', mark: 'O', color: 'bg-slate-900 text-white' },
  { id: 'deepseek', name: 'DeepSeek', model: 'DeepSeek V3', mark: 'D', color: 'bg-blue-600 text-white' },
  { id: 'gemini', name: 'Gemini', model: 'Gemini 2.5 Pro', mark: 'G', color: 'bg-gradient-to-br from-blue-500 to-violet-500 text-white' },
]
