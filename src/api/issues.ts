import { jsonOptions, request, type PageResponse } from './client'
import type { Severity } from './bugs'

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4'

export interface IssueSummary {
  id: number
  projectId: number
  title: string
  summary: string | null
  status: IssueStatus
  priority: Priority | null
  severity: Severity | null
  assigneeName: string | null
  aiConfidence: number | null
  bugCount: number
  importanceScore: number | null
  riskScore: number | null
  firstSeenAt: string
  lastSeenAt: string
  updatedAt: string
}

export interface IssueBug {
  id: number
  title: string
  source: string
  errorType: string | null
  topStackFrame: string | null
  groupedBy: string | null
  confidence: number | null
  occurredAt: string
}

export interface IssueDetail extends Omit<IssueSummary, 'updatedAt'> {
  bugs: IssueBug[]
}

export interface IssueStats {
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  resolvedIssues: number
  totalBugs: number
  bySeverity: Record<string, number>
  byPriority: Record<string, number>
  dailyBugs: Array<{ date: string; count: number }>
}

export type IssueAnalysisStatus = 'COMPLETED' | 'INSUFFICIENT_EVIDENCE' | 'NEEDS_REVIEW'

export interface IssueAnalysisEvidence {
  source_type?: string
  source_id?: string
  source_revision?: string
  repository_id?: string
  commit?: string
  file_path?: string
  location?: string | { path?: string; start_line?: number; end_line?: number }
  statement?: string
  snippet?: string
  observation?: string
}

export interface IssueAnalysisHypothesis {
  hypothesis?: string
  statement?: string
  confidence?: number
}

export interface IssueAnalysisSnapshot {
  issue_id: string
  status: IssueAnalysisStatus
  executive_summary: {
    one_line: string
    impact: string
    confidence: number
  }
  recommended_action?: {
    title: string
    rationale: string
    targets?: Array<{ file_path: string; symbol?: string | null }>
    complexity?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN'
  } | null
  root_cause: string[]
  verification_plan?: {
    steps: string[]
    acceptance_criteria: string[]
  } | null
  risks: Array<{ risk: string; mitigation: string }>
  evidence?: IssueAnalysisEvidence[]
  review: { required: boolean; reasons: string[] }
  /** @deprecated retained only while old cached analysis responses are cleared */
  confidence?: number
  /** @deprecated retained only while old cached analysis responses are cleared */
  findings?: Array<string | { fact?: string; statement?: string }>
  /** @deprecated retained only while old cached analysis responses are cleared */
  hypotheses?: Array<string | IssueAnalysisHypothesis>
  /** @deprecated retained only while old cached analysis responses are cleared */
  warnings?: string[]
  /** @deprecated retained only while old cached analysis responses are cleared */
  resolution_plan?: {
    steps?: Array<string | { action?: string; details?: string; description?: string; title?: string }>
    acceptance_criteria?: string[]
    risks?: Array<string | { risk?: string; mitigation?: string }>
  }
  /** @deprecated retained only while old cached analysis responses are cleared */
  risk_assessment?: {
    risk_score?: number
    priority?: Priority
    rationale?: string
    factors?: Array<{ name?: string; score?: number; rationale?: string }>
  } | null
}

export interface LatestIssueAnalysis {
  analysisResultId: number
  workflowRunId: number
  issueAnalysis: IssueAnalysisSnapshot
}

/**
 * 저장된 분석 결과에는 canonical 응답 계약 이전의 데이터가 남아 있을 수 있다.
 * 화면은 하나의 계약만 다루도록 API 경계에서 표시용 기본값을 보완한다.
 */
function normalizeIssueAnalysis(analysis: IssueAnalysisSnapshot): IssueAnalysisSnapshot {
  const firstFinding = analysis.findings?.[0]
  const fallbackImpact =
    typeof firstFinding === 'string'
      ? firstFinding
      : firstFinding?.fact ?? firstFinding?.statement ?? '분석 상세 정보를 확인하세요.'
  const legacyHypotheses = (analysis.hypotheses ?? [])
    .map((hypothesis) =>
      typeof hypothesis === 'string'
        ? hypothesis
        : hypothesis.hypothesis ?? hypothesis.statement,
    )
    .filter((hypothesis): hypothesis is string => Boolean(hypothesis))
  const legacySteps = (analysis.resolution_plan?.steps ?? [])
    .map((step) => {
      if (typeof step === 'string') return step
      return step.action && step.details
        ? `${step.action}: ${step.details}`
        : step.action ?? step.details ?? step.description ?? step.title
    })
    .filter((step): step is string => Boolean(step))
  const legacyRisks = (analysis.resolution_plan?.risks ?? [])
    .map((risk) =>
      typeof risk === 'string'
        ? { risk, mitigation: '영향 범위와 회귀 여부를 검증하세요.' }
        : risk.risk
          ? { risk: risk.risk, mitigation: risk.mitigation ?? '영향 범위와 회귀 여부를 검증하세요.' }
          : undefined,
    )
    .filter((risk): risk is { risk: string; mitigation: string } => Boolean(risk))
  const firstPlanStep = analysis.resolution_plan?.steps?.[0]
  const legacyAction =
    typeof firstPlanStep === 'string'
      ? { title: firstPlanStep, rationale: '분석 결과의 첫 번째 해결 단계입니다.' }
      : firstPlanStep?.action
        ? {
            title: firstPlanStep.action,
            rationale:
              firstPlanStep.details ??
              firstPlanStep.description ??
              firstPlanStep.title ??
              '분석 결과의 첫 번째 해결 단계입니다.',
          }
        : null

  return {
    ...analysis,
    executive_summary: analysis.executive_summary ?? {
      one_line: analysis.hypotheses?.[0] && typeof analysis.hypotheses[0] !== 'string'
        ? analysis.hypotheses[0].hypothesis ?? '분석 결과'
        : '분석 결과',
      impact: fallbackImpact,
      confidence: analysis.confidence ?? 0,
    },
    root_cause: analysis.root_cause?.length ? analysis.root_cause : legacyHypotheses,
    recommended_action: analysis.recommended_action ?? legacyAction,
    verification_plan: analysis.verification_plan ?? (legacySteps.length
      ? {
          steps: legacySteps,
          acceptance_criteria: analysis.resolution_plan?.acceptance_criteria ?? [],
        }
      : null),
    risks: analysis.risks?.length ? analysis.risks : legacyRisks,
    review: analysis.review ?? {
      required: analysis.status !== 'COMPLETED',
      reasons: analysis.warnings ?? [],
    },
  }
}
export interface CodeEvidenceFile { repository_id: string; commit: string; path: string; start_line: number; end_line: number; content: string; citations: Array<{ evidence_id: string; start_line: number; end_line: number; observation?: string }> }
export interface CodeEvidenceResponse { files: CodeEvidenceFile[]; available?: boolean }

export function getIssues(projectId: number, page = 0, size = 20, sort = 'riskScore,desc') {
  return request<PageResponse<IssueSummary>>(
    `/external-api/v1/projects/${projectId}/issues?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
  )
}

export function getIssue(projectId: number, issueId: number) {
  return request<IssueDetail>(`/external-api/v1/projects/${projectId}/issues/${issueId}`)
}

export function getIssueStats(projectId: number) {
  return request<IssueStats>(`/external-api/v1/projects/${projectId}/issues/stats`)
}

export async function getLatestIssueAnalysis(projectId: number, issueId: number) {
  const result = await request<LatestIssueAnalysis | null>(
    `/external-api/v1/projects/${projectId}/issues/${issueId}/analysis-results/latest`,
  )
  return result
    ? { ...result, issueAnalysis: normalizeIssueAnalysis(result.issueAnalysis) }
    : null
}
export function getCodeEvidence(projectId: number, issueId: number) { return request<CodeEvidenceResponse>(`/external-api/v1/projects/${projectId}/issues/${issueId}/analysis-results/latest/code-evidence`) }

export function updateIssue(projectId: number, issueId: number, update: Partial<Pick<IssueSummary, 'status' | 'priority' | 'severity' | 'assigneeName'>>) {
  return request<IssueSummary>(`/external-api/v1/projects/${projectId}/issues/${issueId}`, jsonOptions('PATCH', update))
}
