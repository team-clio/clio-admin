import { request } from './client'

/** 에이전트 PCM 스냅샷 (Spring 중계 API가 에이전트 JSON을 그대로 통과시킨다) */
export interface PcmSnapshot {
  project_id: string
  pcm_revision: number
  knowledge_index_revision: number
  repository_revisions: Record<string, number>
}

export interface PcmSourceReference {
  source_type: string
  source_id: string
  source_revision: string | null
  locator: Record<string, unknown>
  content_hash: string | null
}

export interface PcmKnowledgeDocument {
  project_id: string
  knowledge_id: string
  logical_key: string
  knowledge_type: string
  title: string
  body_markdown: string
  knowledge_revision: number
  valid_from_pcm_revision: number | null
  valid_until_pcm_revision: number | null
  sources: PcmSourceReference[]
  related_knowledge_ids: string[]
  is_tombstone: boolean
}

export function getPcmSnapshot(projectId: number) {
  return request<PcmSnapshot>(`/external-api/v1/pcm/projects/${projectId}/snapshot`)
}

export function getPcmKnowledge(projectId: number) {
  return request<PcmKnowledgeDocument[]>(
    `/external-api/v1/pcm/projects/${projectId}/knowledge`,
  )
}

export function getPcmKnowledgeDetail(projectId: number, knowledgeId: string) {
  return request<PcmKnowledgeDocument>(
    `/external-api/v1/pcm/projects/${projectId}/knowledge/${encodeURIComponent(knowledgeId)}`,
  )
}
