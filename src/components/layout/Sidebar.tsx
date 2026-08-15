import { Bug, FileText, FlaskConical, FolderCog, Link2, Server, X } from 'lucide-react'
import { IconButton } from '../ui'
import { ProjectPicker } from './ProjectPicker'
import type { ComponentType, Dispatch, SetStateAction } from 'react'
import type { CreateProjectInput, Project } from '../../api/projects'

type Page = 'reports' | 'issues' | 'debug' | 'mcp' | 'project-settings' | 'system'

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

const navSections: Array<{ title: string; items: Array<{ id: Page; label: string; icon: Icon; countKey?: 'reports' | 'issues' }> }> = [
  {
    title: '이슈 관리',
    items: [
      { id: 'reports', label: '버그 리포트', icon: FileText, countKey: 'reports' },
      { id: 'issues', label: '이슈', icon: Bug, countKey: 'issues' },
    ],
  },
  {
    title: '개발자 도구',
    items: [
      { id: 'debug', label: '버그 등록 테스트', icon: FlaskConical },
      { id: 'mcp', label: 'MCP 연동', icon: Link2 },
    ],
  },
  {
    title: '설정',
    items: [
      { id: 'project-settings', label: '프로젝트 설정', icon: FolderCog },
      { id: 'system', label: '시스템 설정', icon: Server },
    ],
  },
]

function NavButton({ active = false, icon: Icon, label, count, onClick }: { active?: boolean; icon: Icon; label: string; count?: number; onClick?: () => void }) {
  return <button onClick={onClick} className={`group mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${active ? 'bg-clio-50 text-clio-700' : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50'}`}><Icon size={17} strokeWidth={active ? 2.5 : 2} className="transition-transform duration-200 group-hover:scale-105" /><span>{label}</span>{count !== undefined && <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] transition-colors ${active ? 'bg-white text-clio-700' : 'bg-slate-100 text-slate-500'}`}>{count.toLocaleString()}</span>}</button>
}

export function Sidebar({ page, navigate, className = '', onClose, projects, selectedProjectId, setSelectedProjectId, projectsLoading, projectsError, onCreateProject, counts = {} }: { page: Page; navigate: (page: Page) => void; className?: string; onClose?: () => void; projects: Project[]; selectedProjectId: number | null; setSelectedProjectId: Dispatch<SetStateAction<number | null>>; projectsLoading: boolean; projectsError: string; onCreateProject: (input: CreateProjectInput) => Promise<Project>; counts?: { reports?: number; issues?: number } }) {
  return (
    <aside className={`${className} fixed bottom-0 left-0 top-14 z-30 w-60 flex-col border-r border-slate-200 bg-white`}>
      <div className="flex items-center gap-2 border-b border-slate-100 p-3"><ProjectPicker projects={projects} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} loading={projectsLoading} loadError={projectsError} onCreateProject={onCreateProject} />{onClose && <IconButton className="shrink-0" onClick={onClose} aria-label="사이드바 닫기"><X size={18} /></IconButton>}</div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, index) => (
          <div key={section.title} className={index > 0 ? 'mt-7' : ''}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{section.title}</p>
            {section.items.map(({ id, countKey, ...item }) => <NavButton key={id} {...item} count={countKey ? counts[countKey] : undefined} active={page === id} onClick={() => navigate(id)} />)}
          </div>
        ))}
      </nav>
    </aside>
  )
}
