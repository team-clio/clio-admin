import { useState } from 'react'
import { Check, ChevronDown, FolderKanban, X } from 'lucide-react'
import { Button, IconButton } from '../ui'

export function ProjectPicker({ projects, setProjects, selectedProject, setSelectedProject }) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [projectName, setProjectName] = useState('')

  const createProject = (event) => {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) return
    setProjects((current) => [...current, name])
    setSelectedProject(name)
    setProjectName('')
    setCreating(false)
  }

  return (
    <div className="relative min-w-0 flex-1">
      <button onClick={() => setOpen((current) => !current)} aria-expanded={open} className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-200 ${open ? 'border-blue-300 bg-blue-50/60 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
        <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold text-slate-400">프로젝트</span><span className="block truncate text-xs font-bold text-slate-800">{selectedProject}</span></span>
        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && <>
        <button className="fixed inset-0 z-40 cursor-default" aria-label="프로젝트 메뉴 닫기" onClick={() => setOpen(false)} />
        <div className="animate-popover absolute left-0 right-0 top-[calc(100%+8px)] z-50 origin-top overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">프로젝트 선택</p>
          {projects.map((project, index) => <button key={project} style={{ animationDelay: `${index * 35}ms` }} onClick={() => { setSelectedProject(project); setOpen(false) }} className={`animate-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors ${project === selectedProject ? 'bg-blue-50 text-clio-700' : 'text-slate-600 hover:bg-slate-50'}`}><span className="min-w-0 flex-1 truncate">{project}</span>{project === selectedProject && <Check size={14} />}</button>)}
          <div className="my-1.5 h-px bg-slate-100" />
          <button onClick={() => { setOpen(false); setCreating(true) }} className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-bold text-clio-600 transition-colors hover:bg-blue-50">프로젝트 추가</button>
        </div>
      </>}

      {creating && <div className="animate-overlay fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
        <button className="absolute inset-0 cursor-default" aria-label="프로젝트 생성 닫기" onClick={() => setCreating(false)} />
        <form onSubmit={createProject} className="animate-modal relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-clio-600"><FolderKanban size={19} /></span><h2 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">새 프로젝트 만들기</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">프로젝트별로 리포트와 이슈를 분리해 관리할 수 있어요.</p></div><IconButton type="button" onClick={() => setCreating(false)} aria-label="닫기"><X size={18} /></IconButton></div>
          <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="project-name">프로젝트 이름</label>
          <input id="project-name" autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="예: Clio Mobile" className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-clio-500 focus:ring-2 focus:ring-blue-100" />
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreating(false)}>취소</Button><Button type="submit" disabled={!projectName.trim()} className="disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-200">프로젝트 만들기</Button></div>
        </form>
      </div>}
    </div>
  )
}
