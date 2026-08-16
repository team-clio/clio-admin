import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createBug, getBugs, type BugSearchParams, type CreateBugRequest } from './bugs'
import {
  getCodeEvidence,
  getIssue,
  getIssues,
  getIssueStats,
  getLatestIssueAnalysis,
  updateIssue,
  type IssueStatus,
} from './issues'
import {
  createProject,
  createProjectRepository,
  deleteProjectRepository,
  getProjectRepositories,
  getProjects,
  updateProject,
  updateProjectRepository,
  type CreateProjectInput,
  type ProjectRepository,
  type RepositoryInput,
} from './projects'
import { getLlmSettings } from './system'
import { getPcmKnowledge, getPcmKnowledgeDetail, getPcmSnapshot } from './pcm'

/** 프로젝트 목록 */
export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects })
}

/** 사이드바의 리포트/이슈 카운트 */
export function useSidebarCounts(projectId: number | null) {
  return useQuery({
    queryKey: ['sidebar-counts', projectId],
    queryFn: async () => {
      const [bugs, issues] = await Promise.all([
        getBugs(projectId as number, { page: 0, size: 1 }),
        getIssueStats(projectId as number),
      ])
      return { reports: bugs.totalElements, issues: issues.totalIssues }
    },
    enabled: projectId !== null,
  })
}

/** 프로젝트 생성 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}

/** 프로젝트 기본 정보 수정 */
export function useUpdateProject(projectId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; description: string }) =>
      updateProject(projectId as number, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}

/** 버그 리포트 (페이지네이션) */
export function useBugs(projectId: number | null, params: BugSearchParams) {
  const page = params.page ?? 0
  const size = params.size ?? 20
  return useQuery({
    queryKey: ['bugs', projectId, { page, size }],
    queryFn: () => getBugs(projectId as number, { page, size }),
    enabled: projectId !== null,
    placeholderData: keepPreviousData,
  })
}

/** 버그 등록 */
export function useCreateBug(projectId: number | null) {
  return useMutation({
    mutationFn: (payload: CreateBugRequest) => createBug(projectId as number, payload),
  })
}

/** 이슈 목록 */
export function useIssues(projectId: number | null, page: number, size: number, sort: string) {
  return useQuery({
    queryKey: ['issues', projectId, { page, size, sort }],
    queryFn: () => getIssues(projectId as number, page, size, sort),
    enabled: projectId !== null,
    placeholderData: keepPreviousData,
  })
}

/** 이슈 통계 */
export function useIssueStats(projectId: number | null) {
  return useQuery({
    queryKey: ['issue-stats', projectId],
    queryFn: () => getIssueStats(projectId as number),
    enabled: projectId !== null,
  })
}

/** 이슈 상세 */
export function useIssue(projectId: number | null, issueId: number | null) {
  return useQuery({
    queryKey: ['issue', projectId, issueId],
    queryFn: () => getIssue(projectId as number, issueId as number),
    enabled: projectId !== null && issueId !== null,
  })
}

/** 이슈 최신 AI 분석 결과 */
export function useLatestIssueAnalysis(projectId: number | null, issueId: number | null) {
  return useQuery({
    queryKey: ['issue-analysis', projectId, issueId],
    queryFn: () => getLatestIssueAnalysis(projectId as number, issueId as number),
    enabled: projectId !== null && issueId !== null,
  })
}

/** 이슈 코드 근거 파일 */
export function useCodeEvidence(projectId: number | null, issueId: number | null) {
  return useQuery({
    queryKey: ['code-evidence', projectId, issueId],
    queryFn: () => getCodeEvidence(projectId as number, issueId as number),
    enabled: projectId !== null && issueId !== null,
  })
}

/** 이슈 상태 변경 */
export function useUpdateIssue(projectId: number | null, issueId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: IssueStatus) =>
      updateIssue(projectId as number, issueId as number, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
      queryClient.invalidateQueries({ queryKey: ['issue', projectId, issueId] })
      queryClient.invalidateQueries({ queryKey: ['issue-stats', projectId] })
    },
  })
}

/** 프로젝트의 레포지토리 목록 */
export function useProjectRepositories(projectId: number | null) {
  return useQuery({
    queryKey: ['repositories', projectId],
    queryFn: () => getProjectRepositories(projectId as number),
    enabled: projectId !== null,
  })
}

/** 레포지토리 생성/수정 */
export function useSaveProjectRepository(projectId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: RepositoryInput }) =>
      id === null
        ? createProjectRepository(projectId as number, input)
        : updateProjectRepository(projectId as number, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['repositories', projectId] }),
  })
}

/** 레포지토리 삭제 */
export function useDeleteProjectRepository(projectId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (repositoryId: number) =>
      deleteProjectRepository(projectId as number, repositoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['repositories', projectId] }),
  })
}

/** LLM 설정 */
export function useLlmSettings() {
  return useQuery({ queryKey: ['llm-settings'], queryFn: getLlmSettings })
}

/** PCM 스냅샷 (revision 정보) */
export function usePcmSnapshot(projectId: number | null) {
  return useQuery({
    queryKey: ['pcm-snapshot', projectId],
    queryFn: () => getPcmSnapshot(projectId as number),
    enabled: projectId !== null,
  })
}

/** PCM 지식 문서 목록 */
export function usePcmKnowledge(projectId: number | null) {
  return useQuery({
    queryKey: ['pcm-knowledge', projectId],
    queryFn: () => getPcmKnowledge(projectId as number),
    enabled: projectId !== null,
  })
}

/** PCM 지식 문서 상세 */
export function usePcmKnowledgeDetail(
  projectId: number | null,
  knowledgeId: string | null,
) {
  return useQuery({
    queryKey: ['pcm-knowledge-detail', projectId, knowledgeId],
    queryFn: () => getPcmKnowledgeDetail(projectId as number, knowledgeId as string),
    enabled: projectId !== null && knowledgeId !== null,
  })
}

export type { ProjectRepository }
