import { CircleHelp, Menu } from 'lucide-react'
import logo from '../../assets/logo.png'
import { IconButton } from '../ui'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-5">
      <IconButton className="mr-3 text-slate-600 lg:hidden" onClick={onMenu} aria-label="메뉴 열기"><Menu size={20} /></IconButton>
      <div className="flex w-55 items-center"><img src={logo} alt="Clio" className="h-8 w-auto object-contain" /></div>
      <div className="ml-auto"><button className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 sm:flex"><CircleHelp size={16} /> 도움말</button></div>
    </header>
  )
}
