import { CheckCircle2, Filter, FolderKanban, Search } from 'lucide-react'
import type { ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode; variant?: 'primary' | 'dark' | 'secondary' | 'ghost' }

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-clio-600 text-white shadow-sm hover:bg-clio-700 hover:-translate-y-0.5 active:translate-y-0',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  }
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-200 ${variants[variant]} ${className}`} {...props}>{children}</button>
}

export function IconButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`grid place-items-center rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95 ${className}`} {...props}>{children}</button>
}

export function Surface({ children, className = '', as: Element = 'section', ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode; as?: ElementType }) {
  return <Element className={`rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${className}`} {...props}>{children}</Element>
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-in flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-8">
      <div><p className="mb-1.5 text-xs font-semibold text-clio-600">{eyebrow}</p><h1 className="text-2xl font-extrabold tracking-[-0.035em] text-slate-900">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>
      {children}
    </div>
  )
}

export function NoProjectSelected() {
  return (
    <div className="grid min-h-[50vh] place-items-center p-8 text-center">
      <div className="max-w-xs">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <FolderKanban size={26} />
        </span>
        <h2 className="mt-5 text-base font-extrabold tracking-tight text-slate-800">프로젝트를 선택해 주세요</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">왼쪽 사이드바의 프로젝트 선택 메뉴에서 작업할 프로젝트를 고르면 이곳에 해당 프로젝트의 데이터가 표시됩니다.</p>
      </div>
    </div>
  )
}

export function Field({ id, label, help, children, className = '' }: { id: string; label: string; help?: string; children: ReactNode; className?: string }) {
  return <div className={className}><label htmlFor={id} className="text-xs font-bold text-slate-700">{label}</label>{children}{help && <p className="mt-2 text-[11px] text-slate-400">{help}</p>}</div>
}

export function Toolbar({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="flex gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all duration-200 focus-within:border-clio-500 focus-within:ring-2 focus-within:ring-blue-100 sm:w-60"><Search size={15} /><input className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" placeholder="제목, ID로 검색" /></label>
        <Button variant="secondary" className="px-3 py-2"><Filter size={14} /> 필터</Button>
      </div>
    </div>
  )
}

export function SettingsFooter({ saved, label }: { saved: boolean; label: string }) {
  return <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">{saved && <span className="animate-pop flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 size={14} /> 저장되었습니다</span>}<Button type="submit">{label}</Button></div>
}
