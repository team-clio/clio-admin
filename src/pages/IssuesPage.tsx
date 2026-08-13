import { useState } from 'react'
import { ArrowRight, Bot, CheckCircle2, ChevronRight, FileText, MoreHorizontal } from 'lucide-react'
import { issues } from '../data/mockData'
import { Button, IconButton, PageHeader, Surface, Toolbar } from '../components/ui'
import type { ReactNode } from 'react'
import type { Issue, IssuePriority } from '../data/mockData'

function Priority({ value }: { value: IssuePriority }) {
  const style = { P0: 'bg-rose-50 text-rose-600 ring-rose-200', P1: 'bg-orange-50 text-orange-600 ring-orange-200', P2: 'bg-amber-50 text-amber-600 ring-amber-200' } satisfies Record<IssuePriority, string>
  return <span className={`mt-0.5 rounded-md px-2 py-1 text-[11px] font-extrabold ring-1 ring-inset ${style[value]}`}>{value}</span>
}

function Label({ children }: { children: ReactNode }) { return <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{children}</h4> }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-1 text-xs font-bold text-slate-700">{value}</p></div> }
function Step({ n }: { n: number }) { return <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">{n}</span> }

function IssueDetail({ issue }: { issue: Issue }) {
  return <aside key={issue.id} className="animate-detail bg-slate-50/40"><div className="border-b border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><Priority value={issue.priority} /><IconButton><MoreHorizontal size={17} /></IconButton></div><p className="mt-4 font-mono text-[11px] font-bold text-clio-600">{issue.id}</p><h2 className="mt-2 text-lg font-extrabold leading-snug tracking-[-0.025em] text-slate-900">{issue.title}</h2></div><div className="space-y-6 p-5"><div><Label>AI 요약</Label><p className="mt-2 text-sm leading-6 text-slate-600">{issue.summary}. 여러 사용자 환경에서 반복적으로 확인되어 우선 대응이 필요합니다.</p></div><div className="grid grid-cols-2 gap-3"><Info label="통합 리포트" value={`${issue.reports}개`} /><Info label="AI 신뢰도" value={`${issue.confidence}%`} /><Info label="담당자" value={issue.owner} /><Info label="최근 업데이트" value={issue.updated} /></div><div><Label>재현 조건</Label><ol className="mt-2 space-y-2 text-xs leading-5 text-slate-600"><li className="flex gap-2"><Step n={1} />iOS 17.4 이상 기기에서 앱 실행</li><li className="flex gap-2"><Step n={2} />로그인 화면에서 소셜 로그인 선택</li><li className="flex gap-2"><Step n={3} />인증 완료 후 앱 복귀 여부 확인</li></ol></div><Button variant="dark" className="w-full text-sm"><Bot size={16} /> 에이전트에 전달 <ArrowRight size={15} /></Button></div></aside>
}

export function IssuesPage() {
  const [selected, setSelected] = useState(issues[0])
  return <div className="animate-page"><PageHeader eyebrow="PRIORITIZED QUEUE" title="이슈" description="유사한 리포트를 통합하고 영향도에 따라 자동 정렬한 작업 목록입니다."><div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} /> 마지막 분석 3분 전</div></PageHeader><div className="p-4 lg:p-8"><Surface className="animate-rise grid overflow-hidden xl:grid-cols-[minmax(560px,1fr)_390px]"><section className="min-w-0 border-slate-200 xl:border-r"><Toolbar label="열린 이슈 9개" /><div className="divide-y divide-slate-100 border-t border-slate-200">{issues.map((issue, index) => <button key={issue.id} style={{ animationDelay: `${80 + index * 50}ms` }} onClick={() => setSelected(issue)} className={`animate-item group flex w-full items-start gap-3 p-4 text-left transition-all duration-200 sm:p-5 ${selected.id === issue.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}><Priority value={issue.priority} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-mono text-[11px] font-semibold text-slate-400">{issue.id}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{issue.state}</span></div><h3 className="mt-1.5 truncate text-sm font-bold text-slate-800">{issue.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{issue.summary}</p><div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400"><span className="flex items-center gap-1"><FileText size={12} /> 리포트 {issue.reports}</span><span>{issue.owner}</span><span>{issue.updated}</span></div></div><ChevronRight size={17} className={`mt-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${selected.id === issue.id ? 'text-clio-600' : 'text-slate-300'}`} /></button>)}</div></section><IssueDetail issue={selected} /></Surface></div></div>
}
