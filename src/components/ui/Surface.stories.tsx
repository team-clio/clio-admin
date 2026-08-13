import { Sparkles } from 'lucide-react'
import { PageHeader, SettingsFooter, Surface, Toolbar } from './index'

export default {
  title: 'Atoms/Surface',
  component: Surface,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export const Basic = {
  render: () => <Surface className="max-w-md p-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-clio-600"><Sparkles size={17} /></span><div><h3 className="text-sm font-extrabold text-slate-800">AI 분석</h3><p className="mt-1 text-xs text-slate-400">리포트를 자동으로 분류합니다.</p></div></div></Surface>,
}
export const SearchToolbar = { render: () => <Surface className="w-full max-w-3xl overflow-hidden"><Toolbar label="전체 2,481개" /></Surface> }
export const Header = { parameters: { layout: 'fullscreen' }, render: () => <PageHeader eyebrow="SYSTEM" title="시스템 설정" description="AI 분석에 사용할 API와 관리자 계정 정보를 관리하세요." /> }
export const SaveFooter = { render: () => <Surface className="w-full max-w-2xl overflow-hidden"><div className="h-28" /><SettingsFooter saved label="API 설정 저장" /></Surface> }
