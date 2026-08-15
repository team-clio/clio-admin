import { Menu } from 'lucide-react'
import logo from '../../assets/logo.png'
import { IconButton } from '../ui'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex w-60 shrink-0 items-center px-3">
        <IconButton className="mr-3 text-slate-600 lg:hidden" onClick={onMenu} aria-label="메뉴 열기"><Menu size={20} /></IconButton>
        <img src={logo} alt="Clio" className="h-8 w-auto object-contain" />
      </div>
    </header>
  )
}
