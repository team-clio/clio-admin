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

export function getIssues(projectId: number, page = 0, size = 20) {
  return request<PageResponse<IssueSummary>>(`/external-api/v1/projects/${projectId}/issues?page=${page}&size=${size}`)
}

export function getIssue(projectId: number, issueId: number) {
  return request<IssueDetail>(`/external-api/v1/projects/${projectId}/issues/${issueId}`)
}

export function getIssueStats(projectId: number) {
  return request<IssueStats>(`/external-api/v1/projects/${projectId}/issues/stats`)
}

export function updateIssue(projectId: number, issueId: number, update: Partial<Pick<IssueSummary, 'status' | 'priority' | 'severity' | 'assigneeName'>>) {
  return request<IssueSummary>(`/external-api/v1/projects/${projectId}/issues/${issueId}`, jsonOptions('PATCH', update))
}
