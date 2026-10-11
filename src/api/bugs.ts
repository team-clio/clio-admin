import { jsonOptions, request, type PageResponse } from './client'

export type BugStatus = 'NEW' | 'ANALYZING' | 'FAILED' | 'NEEDS_REVIEW' | 'TRIAGED' | 'RESOLVED' | 'IGNORED'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface BugSummary {
  id: number
  project_id: number
  issue_id: number | null
  title: string
  source: string
  error_type: string | null
  top_stack_frame: string | null
  status: BugStatus
  severity: Severity | null
  occurred_at: string
  created_at: string
}

export interface BugSearchParams {
  page?: number
  size?: number
  issueId?: number
  source?: string
  status?: BugStatus
  severity?: Severity
  from?: string
  to?: string
}

export interface CreateBugRequest {
  source: string
  title?: string
  description?: string
  error_type?: string
  message?: string
  stack_trace: string[]
  raw_payload?: unknown
  occurred_at: string
}

export interface CreatedBug extends BugSummary {
  grouping?: unknown
}

export function createBug(projectId: number, payload: CreateBugRequest) {
  return request<CreatedBug>(
    `/external-api/v1/projects/${projectId}/bugs`,
    jsonOptions('POST', payload),
  )
}

export function getBugs(projectId: number, params: BugSearchParams = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value))
  })
  const suffix = query.size ? `?${query}` : ''
  return request<PageResponse<BugSummary>>(`/external-api/v1/projects/${projectId}/bugs${suffix}`)
}

/** 매칭이 확신하지 못해 사람의 연결 판단을 기다리는 버그와 Agent가 제안한 후보 Issue */
export interface BugReview {
  bug_id: number
  title: string
  source: string
  error_type: string | null
  occurred_at: string
  candidate_issue_id: number | null
  candidate_issue_title: string | null
  candidate_issue_status: string | null
  confidence: number | null
  reason: string | null
  workflow_run_id: number | null
}

export function getBugReviews(projectId: number) {
  return request<BugReview[]>(`/external-api/v1/projects/${projectId}/bug-reviews`)
}

export function linkReviewedBug(projectId: number, bugId: number, issueId: number) {
  return request<{ issue_id: number; bug_id: number }>(
    `/external-api/v1/projects/${projectId}/bug-reviews/${bugId}/link`,
    jsonOptions('POST', { issue_id: issueId }),
  )
}

export function createIssueFromReview(projectId: number, bugId: number) {
  return request<{ id: number; status: BugStatus }>(
    `/external-api/v1/projects/${projectId}/bug-reviews/${bugId}/create-issue`,
    { method: 'POST' },
  )
}

export function ignoreBug(projectId: number, bugId: number) {
  return request<{ id: number; status: BugStatus }>(
    `/external-api/v1/projects/${projectId}/bugs/${bugId}`,
    jsonOptions('PATCH', { status: 'IGNORED' }),
  )
}

/** Agent 처리에 실패한(FAILED) 버그를 다시 처리 대기열에 넣는다 */
export function retryBug(projectId: number, bugId: number) {
  return request<{ id: number; status: BugStatus }>(
    `/external-api/v1/projects/${projectId}/bugs/${bugId}/retry`,
    { method: 'POST' },
  )
}
