import { useState } from 'react'
import { Check, ChevronDown, FolderKanban, X } from 'lucide-react'
import { Button, IconButton } from '../ui'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { CreateProjectInput, Project } from '../../api/projects'

type ProjectPickerProps = { projects: Project[]; selectedProjectId: number | null; setSelectedProjectId: Dispatch<SetStateAction<number | null>>; loading: boolean; loadError: string; onCreateProject: (input: CreateProjectInput) => Promise<Project> }

export function ProjectPicker({ projects, selectedProjectId, setSelectedProjectId, loading, loadError, onCreateProject }: ProjectPickerProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createError, setCreateError] = useState('')
  const selectedProject = projects.find((project) => project.id === selectedProjectId)

  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) return
    setSubmitting(true)
    setCreateError('')
    try {
      await onCreateProject({ name, description: description.trim() || undefined })
      setProjectName('')
      setDescription('')
      setCreating(false)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : '프로젝트를 만들지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <button disabled={loading} onClick={() => setOpen((current) => !current)} aria-expanded={open} className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-200 disabled:cursor-wait ${open ? 'border-blue-300 bg-blue-50/60 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
        <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold text-slate-400">프로젝트</span><span className={`block truncate text-xs font-bold ${loadError ? 'text-rose-600' : 'text-slate-800'}`}>{loading ? '불러오는 중...' : loadError ? '불러오기 실패' : selectedProject?.name ?? '프로젝트 없음'}</span></span>
        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && <>
        <button className="fixed inset-0 z-40 cursor-default" aria-label="프로젝트 메뉴 닫기" onClick={() => setOpen(false)} />
        <div className="animate-popover absolute left-0 right-0 top-[calc(100%+8px)] z-50 origin-top overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">프로젝트 선택</p>
          {loadError && <p role="alert" className="px-2.5 py-2 text-[11px] leading-4 text-rose-600">{loadError}</p>}
          {projects.length === 0 && <p className="px-2.5 py-3 text-xs text-slate-400">등록된 프로젝트가 없습니다.</p>}
          {projects.map((project, index) => <button key={project.id} style={{ animationDelay: `${index * 35}ms` }} onClick={() => { setSelectedProjectId(project.id); setOpen(false) }} className={`animate-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors ${project.id === selectedProjectId ? 'bg-blue-50 text-clio-700' : 'text-slate-600 hover:bg-slate-50'}`}><span className="min-w-0 flex-1 truncate">{project.name}</span>{project.id === selectedProjectId && <Check size={14} />}</button>)}
          <div className="my-1.5 h-px bg-slate-100" />
          <button onClick={() => { setOpen(false); setCreating(true) }} className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-bold text-clio-600 transition-colors hover:bg-blue-50">프로젝트 추가</button>
        </div>
      </>}

      {creating && <div className="animate-overlay fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
        <button className="absolute inset-0 cursor-default" aria-label="프로젝트 생성 닫기" onClick={() => setCreating(false)} />
        <form onSubmit={createProject} className="animate-modal relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-clio-600"><FolderKanban size={19} /></span><h2 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">새 프로젝트 만들기</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">프로젝트별로 리포트와 이슈를 분리해 관리할 수 있어요.</p></div><IconButton type="button" onClick={() => setCreating(false)} aria-label="닫기"><X size={18} /></IconButton></div>
          <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="project-name">프로젝트 이름</label>
          <input id="project-name" autoFocus maxLength={120} disabled={submitting} value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="예: Clio Mobile" className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
          <label className="mt-4 block text-xs font-bold text-slate-700" htmlFor="project-description">설명 <span className="font-normal text-slate-400">(선택)</span></label>
          <textarea id="project-description" rows={3} maxLength={500} disabled={submitting} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="프로젝트의 제품이나 서비스 범위를 적어주세요." className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
          {createError && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{createError}</p>}
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" disabled={submitting} onClick={() => setCreating(false)}>취소</Button><Button type="submit" disabled={submitting || !projectName.trim()} className="disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-200">{submitting ? '만드는 중...' : '프로젝트 만들기'}</Button></div>
        </form>
      </div>}
    </div>
  )
}
