import { useState } from 'react'
import { AlertCircle, GitMerge, Link2, Plus, X } from 'lucide-react'
import { useBugReviews, useResolveBugReview, type BugReviewDecision } from '../api/hooks'
import type { BugReview } from '../api/bugs'
import { Button, NoProjectSelected, PageHeader, Surface } from '../components/ui'

const sourceLabel: Record<string, string> = { API: 'API', SENTRY: 'Sentry', LOG: '로그', MANUAL: '수동', IN_APP_WIDGET: '인앱 위젯', CUSTOMER_SUPPORT: '고객센터', EMAIL: '이메일', SLACK: 'Slack' }

const header = <PageHeader eyebrow="REVIEW" title="매칭 검토" description="Agent가 기존 이슈와 같은 문제인지 확신하지 못한 버그입니다. 연결할 이슈를 정하거나 새 이슈로 분석을 시작하세요." />

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function formatConfidence(value: number | null) {
  return value === null ? '정보 없음' : `${Math.round(value * 100)}%`
}

function Empty({ error }: { error: string }) {
  return <div className="grid min-h-72 place-items-center p-8 text-center"><div><AlertCircle className={`mx-auto ${error ? 'text-rose-400' : 'text-slate-300'}`} /><p className="mt-3 text-sm font-bold text-slate-700">{error || '검토를 기다리는 버그가 없습니다.'}</p>{error && <p className="mt-1 text-xs text-slate-400">API 서버가 실행 중인지 확인해 주세요.</p>}</div></div>
}

function ReviewCard({ review, pending, onDecide }: { review: BugReview; pending: boolean; onDecide: (decision: BugReviewDecision) => void }) {
  const candidateId = review.candidate_issue_id
  return <article className="border-b border-slate-100 p-5 last:border-b-0">
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <section>
        <p className="font-mono text-xs font-bold text-clio-600">BUG-{review.bug_id}</p>
        <h3 className="mt-1 text-base font-extrabold text-slate-900">{review.title}</h3>
        <p className="mt-1 text-xs text-slate-400">{sourceLabel[review.source] ?? review.source} · {formatDate(review.occurred_at)}{review.error_type ? ` · ${review.error_type}` : ''}</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs text-slate-500"><span className="inline-flex items-center gap-1 font-bold"><GitMerge size={13} /> Agent 제안 후보</span><span>신뢰도 <strong className="text-slate-800">{formatConfidence(review.confidence)}</strong></span></div>
        {candidateId === null
          ? <p className="mt-2 text-sm font-bold text-slate-500">후보 이슈 정보가 없습니다.</p>
          : <p className="mt-2 text-sm font-bold text-slate-800"><span className="font-mono text-clio-700">ISS-{candidateId}</span> {review.candidate_issue_title ?? ''}{review.candidate_issue_status && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">{review.candidate_issue_status}</span>}</p>}
        {review.reason && <p className="mt-2 text-xs leading-5 text-slate-600">{review.reason}</p>}
      </section>
    </div>
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      <Button variant="ghost" disabled={pending} onClick={() => onDecide({ bugId: review.bug_id, action: 'ignore' })}><X size={14} /> 무시</Button>
      <Button variant="secondary" disabled={pending} onClick={() => onDecide({ bugId: review.bug_id, action: 'create-issue' })}><Plus size={14} /> 새 이슈로 분석</Button>
      <Button disabled={pending || candidateId === null} onClick={() => candidateId !== null && onDecide({ bugId: review.bug_id, action: 'link', issueId: candidateId })}><Link2 size={14} /> ISS-{candidateId ?? '?'}에 연결</Button>
    </div>
  </article>
}

export function BugReviewsPage({ projectId }: { projectId: number | null }) {
  const reviewsQuery = useBugReviews(projectId)
  const resolveMutation = useResolveBugReview(projectId)
  const [pendingBugId, setPendingBugId] = useState<number | null>(null)

  if (projectId === null) {
    return <div className="animate-page">{header}<NoProjectSelected /></div>
  }

  const reviews = reviewsQuery.data ?? []
  const loading = reviewsQuery.isPending
  const error = reviewsQuery.error instanceof Error ? reviewsQuery.error.message : ''
  const actionError = resolveMutation.error instanceof Error ? resolveMutation.error.message : ''

  const decide = (decision: BugReviewDecision) => {
    setPendingBugId(decision.bugId)
    resolveMutation.mutate(decision, { onSettled: () => setPendingBugId(null) })
  }

  return <div className="animate-page">{header}<div className="p-4 lg:p-8">
    {actionError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-4 text-sm font-bold text-rose-700">{actionError}</p>}
    <Surface className="overflow-hidden">
      <div className="flex items-center justify-between p-4"><span className="text-sm font-bold text-slate-700">{loading ? '불러오는 중...' : `검토 대기 ${reviews.length.toLocaleString()}건`}</span></div>
      {!loading && (error || reviews.length === 0)
        ? <Empty error={error} />
        : <div className="border-t border-slate-200">{reviews.map((review) => <ReviewCard key={review.bug_id} review={review} pending={pendingBugId === review.bug_id} onDecide={decide} />)}</div>}
    </Surface>
    <p className="mt-4 text-xs leading-5 text-slate-400">새 이슈로 분석하면 버그가 다시 처리 대기열에 들어가고, Agent가 매칭 없이 새 이슈를 만들어 분석합니다. 연결된 저장소가 모두 동기화된 상태여야 합니다.</p>
  </div></div>
}
