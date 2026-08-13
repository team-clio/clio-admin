import { request, type PageResponse } from './client'

export type BugStatus = 'NEW' | 'ANALYZING' | 'TRIAGED' | 'RESOLVED' | 'IGNORED'
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

export function getBugs(projectId: number, params: BugSearchParams = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value))
  })
  const suffix = query.size ? `?${query}` : ''
  return request<PageResponse<BugSummary>>(`/external-api/v1/projects/${projectId}/bugs${suffix}`)
}
