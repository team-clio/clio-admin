import { Bug, FileText, Link2, Settings, X } from 'lucide-react'
import { IconButton } from '../ui'
import { ProjectPicker } from './ProjectPicker'
import type { ComponentType, Dispatch, SetStateAction } from 'react'
import type { Project } from '../../api/projects'

type Page = 'reports' | 'issues' | 'mcp' | 'system'

const navItems: Array<{ id: Exclude<Page, 'system'>; label: string; icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; count?: number }> = [
  { id: 'reports', label: '버그 리포트', icon: FileText, count: 24 },
  { id: 'issues', label: '이슈', icon: Bug, count: 9 },
  { id: 'mcp', label: 'MCP 연동', icon: Link2 },
]

function NavButton({ active = false, icon: Icon, label, count, onClick }: { active?: boolean; icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string; count?: number; onClick?: () => void }) {
  return <button onClick={onClick} className={`group mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${active ? 'bg-clio-50 text-clio-700' : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50'}`}><Icon size={17} strokeWidth={active ? 2.5 : 2} className="transition-transform duration-200 group-hover:scale-105" /><span>{label}</span>{count && <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] transition-colors ${active ? 'bg-white text-clio-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}</button>
}

export function Sidebar({ page, navigate, className = '', onClose, projects, selectedProjectId, setSelectedProjectId, projectsLoading, projectsError, onCreateProject }: { page: Page; navigate: (page: Page) => void; className?: string; onClose?: () => void; projects: Project[]; selectedProjectId: number | null; setSelectedProjectId: Dispatch<SetStateAction<number | null>>; projectsLoading: boolean; projectsError: string; onCreateProject: (name: string) => Promise<Project> }) {
  return (
    <aside className={`${className} fixed bottom-0 left-0 top-14 z-30 w-60 flex-col border-r border-slate-200 bg-white`}>
      <div className="flex items-center gap-2 border-b border-slate-100 p-3"><ProjectPicker projects={projects} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} loading={projectsLoading} loadError={projectsError} onCreateProject={onCreateProject} />{onClose && <IconButton className="shrink-0" onClick={onClose} aria-label="사이드바 닫기"><X size={18} /></IconButton>}</div>
      <nav className="flex-1 px-3 py-4"><p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">이슈 관리</p>{navItems.map(({ id, ...item }) => <NavButton key={id} {...item} active={page === id} onClick={() => navigate(id)} />)}<p className="mb-2 mt-7 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">설정</p><NavButton icon={Settings} label="프로젝트 설정" /></nav>
      <div className="border-t border-slate-100 p-3"><NavButton icon={Settings} label="시스템 설정" active={page === 'system'} onClick={() => navigate('system')} /></div>
    </aside>
  )
}
