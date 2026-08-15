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
  status: IssueAnalysisStatus
  confidence?: number
  findings?: Array<string | { fact?: string; statement?: string }>
  hypotheses?: Array<string | IssueAnalysisHypothesis>
  evidence?: IssueAnalysisEvidence[]
  warnings?: string[]
  resolution_plan?: {
    steps?: Array<string | { description?: string; title?: string }>
    acceptance_criteria?: string[]
    risks?: string[]
  }
}

export interface LatestIssueAnalysis {
  analysisResultId: number
  workflowRunId: number
  issueAnalysis: IssueAnalysisSnapshot
}

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

export function updateIssue(projectId: number, issueId: number, update: Partial<Pick<IssueSummary, 'status' | 'priority' | 'severity' | 'assigneeName'>>) {
  return request<IssueSummary>(`/external-api/v1/projects/${projectId}/issues/${issueId}`, jsonOptions('PATCH', update))
}
