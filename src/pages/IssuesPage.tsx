import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, FileText, LoaderCircle } from 'lucide-react'
import { getIssue, getIssues, getIssueStats, updateIssue, type IssueDetail, type IssueStats, type IssueSummary, type IssueStatus, type Priority } from '../api/issues'
import { Button, PageHeader, Surface } from '../components/ui'

const statusLabel: Record<IssueStatus, string> = { OPEN: '열림', IN_PROGRESS: '진행 중', RESOLVED: '해결됨', CLOSED: '닫힘' }
const priorityStyle: Record<Priority, string> = { P0: 'bg-rose-50 text-rose-600', P1: 'bg-orange-50 text-orange-600', P2: 'bg-amber-50 text-amber-600', P3: 'bg-blue-50 text-blue-600', P4: 'bg-slate-100 text-slate-500' }
const formatDate = (value: string) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

export function IssuesPage({ projectId }: { projectId: number | null }) {
  const [items, setItems] = useState<IssueSummary[]>([])
  const [stats, setStats] = useState<IssueStats | null>(null)
  const [selected, setSelected] = useState<IssueDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (projectId === null) return
    let active = true
    Promise.all([getIssues(projectId), getIssueStats(projectId)]).then(([issues, nextStats]) => {
      if (!active) return
      setItems(issues.items); setStats(nextStats)
      if (issues.items[0]) {
        setDetailLoading(true)
        getIssue(projectId, issues.items[0].id).then((detail) => active && setSelected(detail)).catch((reason) => active && setError(reason instanceof Error ? reason.message : '상세를 불러오지 못했습니다.')).finally(() => active && setDetailLoading(false))
      }
    }).catch((reason) => active && setError(reason instanceof Error ? reason.message : '이슈를 불러오지 못했습니다.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [projectId])

  const loadDetail = (issueId: number, targetProjectId = projectId) => {
    if (targetProjectId === null) return
    setDetailLoading(true)
    getIssue(targetProjectId, issueId).then(setSelected).catch((reason) => setError(reason instanceof Error ? reason.message : '상세를 불러오지 못했습니다.')).finally(() => setDetailLoading(false))
  }

  const changeStatus = async (status: IssueStatus) => {
    if (!projectId || !selected) return
    setUpdating(true); setError('')
    try {
      const updated = await updateIssue(projectId, selected.id, { status })
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelected((current) => current ? { ...current, ...updated } : current)
      setStats(await getIssueStats(projectId))
    } catch (reason) { setError(reason instanceof Error ? reason.message : '상태를 변경하지 못했습니다.') }
    finally { setUpdating(false) }
  }

  return <div className="animate-page"><PageHeader eyebrow="PRIORITIZED QUEUE" title="이슈" description="서버에서 계산된 우선순위와 연결 버그를 확인합니다.">{stats && <div className="flex gap-3 text-xs font-bold text-slate-600"><span>열림 {stats.openIssues}</span><span>진행 {stats.inProgressIssues}</span><span>해결 {stats.resolvedIssues}</span></div>}</PageHeader><div className="p-4 lg:p-8">{error && <p role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-700"><AlertCircle size={15} />{error}</p>}<Surface className="grid min-h-120 overflow-hidden xl:grid-cols-[minmax(560px,1fr)_390px]"><section className="border-r border-slate-200"><div className="border-b border-slate-200 p-4 text-sm font-bold text-slate-700">{loading ? '불러오는 중...' : `전체 ${stats?.totalIssues ?? items.length}개`}</div>{!loading && items.length === 0 ? <div className="grid h-80 place-items-center text-sm text-slate-400">{projectId ? '등록된 이슈가 없습니다.' : '프로젝트를 먼저 선택하세요.'}</div> : <div className="divide-y divide-slate-100">{items.map((issue) => <button key={issue.id} onClick={() => loadDetail(issue.id)} className={`flex w-full items-start gap-3 p-5 text-left hover:bg-slate-50 ${selected?.id === issue.id ? 'bg-blue-50/60' : ''}`}><span className={`rounded-md px-2 py-1 text-xs font-extrabold ${issue.priority ? priorityStyle[issue.priority] : 'bg-slate-100 text-slate-400'}`}>{issue.priority ?? '—'}</span><div className="min-w-0 flex-1"><p className="font-mono text-xs text-slate-400">ISS-{issue.id} · {statusLabel[issue.status]}</p><h3 className="mt-1 truncate text-sm font-bold text-slate-800">{issue.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{issue.summary ?? '요약 없음'}</p><p className="mt-3 flex gap-4 text-xs text-slate-400"><span className="flex items-center gap-1"><FileText size={12} /> 버그 {issue.bugCount}</span><span>{issue.assigneeName ?? '담당자 미지정'}</span><span>{formatDate(issue.lastSeenAt)}</span></p></div><ChevronRight size={17} className="mt-5 text-slate-300" /></button>)}</div>}</section><aside className="bg-slate-50/40 p-5">{detailLoading ? <LoaderCircle className="mx-auto mt-20 animate-spin text-clio-600" /> : selected ? <><div className="flex justify-between"><div><p className="font-mono text-xs font-bold text-clio-600">ISS-{selected.id}</p><h2 className="mt-2 text-lg font-extrabold text-slate-900">{selected.title}</h2></div><span className="text-xs font-bold text-slate-500">{statusLabel[selected.status]}</span></div><p className="mt-5 text-sm leading-6 text-slate-600">{selected.summary ?? '등록된 요약이 없습니다.'}</p><dl className="mt-5 grid grid-cols-2 gap-3"><Info label="통합 버그" value={`${selected.bugCount}개`} /><Info label="AI 신뢰도" value={selected.aiConfidence === null ? '미지정' : `${Math.round(selected.aiConfidence * (selected.aiConfidence <= 1 ? 100 : 1))}%`} /><Info label="담당자" value={selected.assigneeName ?? '미지정'} /><Info label="심각도" value={selected.severity ?? '미지정'} /></dl><section className="mt-6"><h3 className="text-xs font-bold text-slate-500">연결된 버그</h3><div className="mt-2 space-y-2">{selected.bugs.length ? selected.bugs.map((bug) => <div key={bug.id} className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-xs font-bold text-slate-700">{bug.title}</p><p className="mt-1 text-[11px] text-slate-400">BUG-{bug.id} · {bug.source}</p></div>) : <p className="text-xs text-slate-400">연결된 버그가 없습니다.</p>}</div></section><div className="mt-6 flex flex-wrap gap-2">{selected.status === 'OPEN' && <Button disabled={updating} onClick={() => changeStatus('IN_PROGRESS')}>진행 시작</Button>}{selected.status === 'IN_PROGRESS' && <Button disabled={updating} onClick={() => changeStatus('RESOLVED')}><CheckCircle2 size={14} /> 해결 처리</Button>}{(selected.status === 'RESOLVED' || selected.status === 'CLOSED') && <Button variant="secondary" disabled={updating} onClick={() => changeStatus('OPEN')}>다시 열기</Button>}</div></> : <p className="mt-20 text-center text-sm text-slate-400">이슈를 선택하세요.</p>}</aside></Surface></div></div>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 bg-white p-3"><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 text-xs font-bold text-slate-700">{value}</dd></div> }
