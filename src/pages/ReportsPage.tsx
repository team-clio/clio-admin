import { useEffect, useState } from 'react'
import { AlertCircle, Bug, Clock3, FileText, Link2, Server } from 'lucide-react'
import { getBugs, type BugSummary, type BugStatus, type Severity } from '../api/bugs'
import { Button, IconButton, NoProjectSelected, PageHeader, Surface } from '../components/ui'

const statusLabel: Record<BugStatus, string> = { NEW: '새 리포트', ANALYZING: '분석 중', TRIAGED: '분류 완료', RESOLVED: '해결됨', IGNORED: '무시됨' }
const statusStyle: Record<BugStatus, string> = {
  NEW: 'bg-violet-50 text-violet-700', ANALYZING: 'bg-blue-50 text-blue-700', TRIAGED: 'bg-emerald-50 text-emerald-700', RESOLVED: 'bg-slate-100 text-slate-600', IGNORED: 'bg-slate-100 text-slate-400',
}
const severityLabel: Record<Severity, string> = { CRITICAL: '긴급', HIGH: '높음', MEDIUM: '보통', LOW: '낮음' }
const severityDot: Record<Severity, string> = { CRITICAL: 'bg-rose-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-amber-500', LOW: 'bg-slate-300' }
const sourceLabel: Record<string, string> = { API: 'API', SENTRY: 'Sentry', LOG: '로그', MANUAL: '수동', IN_APP_WIDGET: '인앱 위젯', CUSTOMER_SUPPORT: '고객센터', EMAIL: '이메일', SLACK: 'Slack' }

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function Empty({ projectId, error }: { projectId: number | null; error: string }) {
  return <div className="grid min-h-72 place-items-center p-8 text-center"><div><AlertCircle className={`mx-auto ${error ? 'text-rose-400' : 'text-slate-300'}`} /><p className="mt-3 text-sm font-bold text-slate-700">{error || (projectId ? '수집된 버그가 없습니다.' : '프로젝트를 먼저 선택하세요.')}</p>{error && <p className="mt-1 text-xs text-slate-400">API 서버가 실행 중인지 확인해 주세요.</p>}</div></div>
}

function Detail({ bug, onClose }: { bug: BugSummary; onClose: () => void }) {
  return <div className="animate-overlay fixed inset-x-0 bottom-0 top-14 z-[70]"><button className="absolute inset-0 bg-slate-950/30" aria-label="닫기" onClick={onClose} /><aside className="animate-drawer absolute bottom-0 right-0 top-0 w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><p className="font-mono text-xs font-bold text-clio-600">BUG-{bug.id}</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">{bug.title}</h2></div><IconButton onClick={onClose}>×</IconButton></div><dl className="mt-7 grid grid-cols-2 gap-3 text-sm"><Info label="상태" value={statusLabel[bug.status]} /><Info label="심각도" value={bug.severity ? severityLabel[bug.severity] : '미지정'} /><Info label="소스" value={sourceLabel[bug.source] ?? bug.source} /><Info label="발생 시각" value={formatDate(bug.occurred_at)} /><Info label="오류 유형" value={bug.error_type ?? '없음'} /><Info label="연결 이슈" value={bug.issue_id ? `ISS-${bug.issue_id}` : '미연결'} /></dl>{bug.top_stack_frame && <section className="mt-6"><h3 className="text-xs font-bold text-slate-500">최상위 스택 프레임</h3><pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">{bug.top_stack_frame}</pre></section>}<p className="mt-6 rounded-lg bg-blue-50 p-4 text-xs leading-5 text-blue-700">현재 버그 조회 API가 제공하는 필드만 표시합니다. 원문, 제보자, 환경 및 재현 단계는 서버 응답에 포함되어 있지 않습니다.</p></aside></div>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 p-3"><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-700">{value}</dd></div> }

export function ReportsPage({ projectId }: { projectId: number | null }) {
  const [items, setItems] = useState<BugSummary[]>([])
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<BugSummary | null>(null)

  useEffect(() => {
    if (projectId === null) return
    let active = true
    getBugs(projectId, { page, size: 20 }).then((response) => {
      if (!active) return
      setItems(response.items); setTotalElements(response.totalElements); setTotalPages(response.totalPages)
    }).catch((reason) => active && setError(reason instanceof Error ? reason.message : '버그를 불러오지 못했습니다.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [projectId, page])

  if (projectId === null) {
    return <div className="animate-page"><PageHeader eyebrow="INBOX" title="버그 리포트" description="선택한 프로젝트에 수집된 버그를 서버에서 조회합니다." /><NoProjectSelected /></div>
  }

  const newCount = items.filter((item) => item.status === 'NEW').length
  const analyzingCount = items.filter((item) => item.status === 'ANALYZING').length
  const linkedCount = items.filter((item) => item.issue_id !== null).length

  return <div className="animate-page"><PageHeader eyebrow="INBOX" title="버그 리포트" description="선택한 프로젝트에 수집된 버그를 서버에서 조회합니다." /><div className="p-4 lg:p-8"><div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4"><Stat label="전체 리포트" value={String(totalElements)} icon={FileText} /><Stat label="현재 페이지 신규" value={String(newCount)} icon={Clock3} /><Stat label="현재 페이지 분석 중" value={String(analyzingCount)} icon={Server} /><Stat label="현재 페이지 이슈 연결" value={String(linkedCount)} icon={Bug} /></div><Surface className="overflow-hidden"><div className="flex items-center justify-between p-4"><span className="text-sm font-bold text-slate-700">{loading ? '불러오는 중...' : `전체 ${totalElements.toLocaleString()}개`}</span></div>{!loading && (error || items.length === 0) ? <Empty projectId={projectId} error={error} /> : <div className="overflow-x-auto"><table className="w-full min-w-200 text-left"><thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-400"><tr><th className="px-5 py-3">리포트</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">심각도</th><th className="px-4 py-3">연결 이슈</th><th className="px-4 py-3">발생</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((bug) => <tr key={bug.id} onClick={() => setSelected(bug)} className="cursor-pointer text-sm hover:bg-slate-50"><td className="px-5 py-4"><strong className="text-slate-800">{bug.title}</strong><span className="mt-1 block text-xs text-slate-400">BUG-{bug.id} · {sourceLabel[bug.source] ?? bug.source}</span></td><td className="px-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[bug.status]}`}>{statusLabel[bug.status]}</span></td><td className="px-4">{bug.severity ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700"><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${severityDot[bug.severity]}`} />{severityLabel[bug.severity]}</span> : <span className="text-xs font-bold text-slate-300">미지정</span>}</td><td className="px-4 font-mono text-xs text-clio-700">{bug.issue_id ? <span className="inline-flex items-center gap-1"><Link2 size={12} /> ISS-{bug.issue_id}</span> : '미연결'}</td><td className="px-4 text-xs text-slate-500">{formatDate(bug.occurred_at)}</td></tr>)}</tbody></table></div>}<div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400"><span>{totalPages ? `${page + 1} / ${totalPages} 페이지` : '0 페이지'}</span><div className="flex gap-2"><Button variant="secondary" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)}>이전</Button><Button variant="secondary" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>다음</Button></div></div></Surface></div>{selected && <Detail bug={selected} onClose={() => setSelected(null)} />}</div>
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex justify-between text-sm text-slate-500"><span>{label}</span><Icon size={16} /></div><strong className="mt-3 block text-2xl text-slate-900">{value}</strong></div> }
