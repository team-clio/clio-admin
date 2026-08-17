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

export function getLatestIssueAnalysis(projectId: number, issueId: number) {
  return request<LatestIssueAnalysis | null>(
    `/external-api/v1/projects/${projectId}/issues/${issueId}/analysis-results/latest`,
  )
}
export function getCodeEvidence(projectId: number, issueId: number) { return request<CodeEvidenceResponse>(`/external-api/v1/projects/${projectId}/issues/${issueId}/analysis-results/latest/code-evidence`) }

export function updateIssue(projectId: number, issueId: number, update: Partial<Pick<IssueSummary, 'status' | 'priority' | 'severity' | 'assigneeName'>>) {
  return request<IssueSummary>(`/external-api/v1/projects/${projectId}/issues/${issueId}`, jsonOptions('PATCH', update))
}
