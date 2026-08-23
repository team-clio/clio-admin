import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { Project } from '../../api/projects'

type ProjectPickerProps = { projects: Project[]; selectedProjectId: number | null; setSelectedProjectId: Dispatch<SetStateAction<number | null>>; loading: boolean; loadError: string; onAddProject: () => void }

export function ProjectPicker({ projects, selectedProjectId, setSelectedProjectId, loading, loadError, onAddProject }: ProjectPickerProps) {
  const [open, setOpen] = useState(false)
  const selectedProject = projects.find((project) => project.id === selectedProjectId)

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
          <button onClick={() => { setOpen(false); onAddProject() }} className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-bold text-clio-600 transition-colors hover:bg-blue-50">프로젝트 추가</button>
        </div>
      </>}
    </div>
  )
}
