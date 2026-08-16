import { useState } from 'react'
import { AlertCircle, CheckCircle2, ExternalLink, GitBranch, FolderGit2, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import {
  useDeleteProjectRepository,
  useProjectRepositories,
  useSaveProjectRepository,
  useUpdateProject,
} from '../api/hooks'
import type { Project, ProjectRepository, RepositoryInput, RepositoryProvider } from '../api/projects'
import { Button, Field, IconButton, NoProjectSelected, PageHeader, Surface } from '../components/ui'

const emptyRepository: RepositoryInput = { provider: 'GITHUB', owner: '', name: '', url: '', defaultBranch: 'main', includePaths: [], excludePaths: [], enabled: true }
const inputClass = 'mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
const syncLabel = { PENDING: '동기화 대기', SYNCING: '동기화 중', SYNCED: '동기화 완료', FAILED: '동기화 실패' }
const syncStyle = { PENDING: 'bg-amber-50 text-amber-700', SYNCING: 'bg-blue-50 text-blue-700', SYNCED: 'bg-emerald-50 text-emerald-700', FAILED: 'bg-rose-50 text-rose-700' }

function splitPaths(value: string) {
  return value.split(',').map((path) => path.trim()).filter(Boolean)
}

function RepositoryDialog({ repository, submitting, onClose, onSubmit }: { repository: ProjectRepository | null; submitting: boolean; onClose: () => void; onSubmit: (input: RepositoryInput) => Promise<void> }) {
  const [form, setForm] = useState<RepositoryInput>(repository ? { provider: repository.provider, owner: repository.owner, name: repository.name, url: repository.url, defaultBranch: repository.defaultBranch, includePaths: repository.includePaths, excludePaths: repository.excludePaths, enabled: repository.enabled } : emptyRepository)
  const [error, setError] = useState('')
  const set = <K extends keyof RepositoryInput>(key: K, value: RepositoryInput[K]) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.owner.trim() || !form.name.trim() || !form.url.trim()) { setError('소유자, 저장소 이름, URL을 모두 입력해 주세요.'); return }
    setError('')
    await onSubmit({ ...form, owner: form.owner.trim(), name: form.name.trim(), url: form.url.trim(), defaultBranch: form.defaultBranch.trim() || 'main' })
  }

  return <div className="animate-overlay fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-[2px]"><button className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} /><form onSubmit={submit} className="animate-modal relative my-6 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 p-6"><div><span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white"><FolderGit2 size={19} /></span><h2 className="mt-4 text-lg font-extrabold text-slate-900">{repository ? '레포지토리 수정' : '레포지토리 연결'}</h2><p className="mt-1 text-xs text-slate-500">코드 분석에 사용할 저장소와 범위를 설정합니다.</p></div><IconButton type="button" onClick={onClose} aria-label="닫기"><X size={18} /></IconButton></div><div className="grid gap-5 p-6 sm:grid-cols-2"><Field id="repo-provider" label="Provider"><select id="repo-provider" value={form.provider} onChange={(event) => set('provider', event.target.value as RepositoryProvider)} className={inputClass}><option value="GITHUB">GitHub</option><option value="GITLAB">GitLab</option><option value="BITBUCKET">Bitbucket</option></select></Field><Field id="repo-branch" label="기본 브랜치"><input id="repo-branch" value={form.defaultBranch} onChange={(event) => set('defaultBranch', event.target.value)} className={inputClass} placeholder="main" /></Field><Field id="repo-owner" label="소유자"><input id="repo-owner" value={form.owner} onChange={(event) => set('owner', event.target.value)} className={inputClass} placeholder="openai" /></Field><Field id="repo-name" label="저장소 이름"><input id="repo-name" value={form.name} onChange={(event) => set('name', event.target.value)} className={inputClass} placeholder="clio" /></Field><Field id="repo-url" label="저장소 URL" className="sm:col-span-2"><input id="repo-url" type="url" value={form.url} onChange={(event) => set('url', event.target.value)} className={inputClass} placeholder="https://github.com/openai/clio" /></Field><Field id="include-paths" label="분석 경로" help="쉼표로 여러 경로를 구분합니다." className="sm:col-span-2"><input id="include-paths" value={form.includePaths.join(', ')} onChange={(event) => set('includePaths', splitPaths(event.target.value))} className={inputClass} placeholder="src, packages/api" /></Field><Field id="exclude-paths" label="제외 경로" help="빌드 결과물이나 외부 의존성을 제외할 수 있습니다." className="sm:col-span-2"><input id="exclude-paths" value={form.excludePaths.join(', ')} onChange={(event) => set('excludePaths', splitPaths(event.target.value))} className={inputClass} placeholder="dist, node_modules" /></Field><label className="sm:col-span-2 flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.enabled} onChange={(event) => set('enabled', event.target.checked)} className="size-4 accent-blue-600" />이 저장소의 코드 분석 활성화</label>{error && <p role="alert" className="sm:col-span-2 text-xs font-bold text-rose-600">{error}</p>}</div><div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4"><Button type="button" variant="secondary" disabled={submitting} onClick={onClose}>취소</Button><Button type="submit" disabled={submitting}>{submitting ? <LoaderCircle size={14} className="animate-spin" /> : null}{repository ? '변경사항 저장' : '레포지토리 연결'}</Button></div></form></div>
}

export function ProjectSettingsPage({ project }: { project: Project | null }) {
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<ProjectRepository | null | undefined>(undefined)

  const projectId = project?.id ?? null
  const repositoriesQuery = useProjectRepositories(projectId)
  const updateProjectMutation = useUpdateProject(projectId)
  const saveRepositoryMutation = useSaveProjectRepository(projectId)
  const deleteRepositoryMutation = useDeleteProjectRepository(projectId)

  if (!project) return <div className="animate-page"><PageHeader eyebrow="PROJECT" title="프로젝트 설정" description="프로젝트의 기본 정보와 연결된 레포지토리를 관리합니다." /><NoProjectSelected /></div>

  const repositories = repositoriesQuery.data ?? []
  const loading = repositoriesQuery.isPending
  const loadError = repositoriesQuery.error instanceof Error ? repositoriesQuery.error.message : ''
  const displayError = loadError || error

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault(); if (!name.trim()) return
    setSaved(false); setError('')
    try { await updateProjectMutation.mutateAsync({ name: name.trim(), description: description.trim() }); setSaved(true) }
    catch (reason) { setError(reason instanceof Error ? reason.message : '프로젝트를 저장하지 못했습니다.') }
  }

  const saveRepository = async (input: RepositoryInput) => {
    setError('')
    try { await saveRepositoryMutation.mutateAsync({ id: editing?.id ?? null, input }); setEditing(undefined) }
    catch (reason) { setError(reason instanceof Error ? reason.message : '레포지토리를 저장하지 못했습니다.') }
  }

  const removeRepository = async (repository: ProjectRepository) => {
    if (!window.confirm(`${repository.owner}/${repository.name} 연결을 삭제할까요?`)) return
    setError('')
    try { await deleteRepositoryMutation.mutateAsync(repository.id) }
    catch (reason) { setError(reason instanceof Error ? reason.message : '레포지토리 연결을 삭제하지 못했습니다.') }
  }

  return <div className="animate-page"><PageHeader eyebrow="PROJECT" title="프로젝트 설정" description="프로젝트의 기본 정보와 코드 분석에 사용할 레포지토리를 관리합니다."><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{project.status === 'ACTIVE' ? '활성' : project.status}</span></PageHeader><div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">{displayError && <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700"><AlertCircle size={15} />{displayError}</p>}<Surface className="overflow-hidden"><form onSubmit={saveProject}><div className="border-b border-slate-100 p-6"><h2 className="text-sm font-extrabold text-slate-800">기본 정보</h2><p className="mt-1 text-xs text-slate-400">사이드바와 프로젝트 목록에 표시되는 정보입니다.</p></div><div className="grid gap-5 p-6"><Field id="settings-name" label="프로젝트 이름"><input id="settings-name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></Field><Field id="settings-description" label="설명"><textarea id="settings-description" rows={4} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} resize-none`} placeholder="프로젝트의 제품이나 서비스 범위를 적어주세요." /></Field></div><div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">{saved && <span className="animate-pop flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 size={14} />저장되었습니다</span>}<Button type="submit" disabled={updateProjectMutation.isPending || !name.trim()}>{updateProjectMutation.isPending ? '저장 중...' : '기본 정보 저장'}</Button></div></form></Surface><Surface className="overflow-hidden"><div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-extrabold text-slate-800">레포지토리</h2><p className="mt-1 text-xs text-slate-400">한 프로젝트에 여러 코드 저장소를 연결할 수 있습니다.</p></div><Button onClick={() => setEditing(null)}><Plus size={15} />레포지토리 연결</Button></div>{loading ? <p className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" />레포지토리를 불러오는 중입니다.</p> : repositories.length === 0 ? <div className="p-12 text-center"><FolderGit2 className="mx-auto text-slate-300" size={32} /><p className="mt-3 text-sm font-bold text-slate-700">연결된 레포지토리가 없습니다.</p><p className="mt-1 text-xs text-slate-400">코드 분석을 시작하려면 저장소를 연결해 주세요.</p></div> : <div className="divide-y divide-slate-100">{repositories.map((repository) => <div key={repository.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><FolderGit2 size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-extrabold text-slate-800">{repository.owner}/{repository.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${syncStyle[repository.syncStatus]}`}>{syncLabel[repository.syncStatus]}</span>{!repository.enabled && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">분석 중지</span>}</div><p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400"><span className="flex items-center gap-1"><GitBranch size={12} />{repository.defaultBranch}</span><span>{repository.provider}</span>{repository.lastSyncedAt && <span>마지막 동기화 {new Date(repository.lastSyncedAt).toLocaleString('ko-KR')}</span>}</p></div><div className="flex gap-1"><IconButton onClick={() => window.open(repository.url, '_blank', 'noopener,noreferrer')} aria-label="저장소 열기"><ExternalLink size={16} /></IconButton><IconButton onClick={() => setEditing(repository)} aria-label="수정"><Pencil size={16} /></IconButton><IconButton onClick={() => removeRepository(repository)} aria-label="삭제" className="hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></IconButton></div></div>)}</div>}<div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-[11px] text-slate-400"><RefreshCw size={13} />동기화는 서버에서 연결 확인 후 자동으로 시작됩니다.</div></Surface></div>{editing !== undefined && <RepositoryDialog repository={editing} submitting={saveRepositoryMutation.isPending || deleteRepositoryMutation.isPending} onClose={() => setEditing(undefined)} onSubmit={saveRepository} />}</div>
}
