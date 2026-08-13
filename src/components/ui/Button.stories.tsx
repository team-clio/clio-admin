import { Plus, Settings, Trash2 } from 'lucide-react'
import { Button, IconButton } from './index'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: '저장하기', variant: 'primary' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'dark', 'secondary', 'ghost'] },
    disabled: { control: 'boolean' },
  },
}

export default meta

export const Playground = {}
export const WithIcon = { args: { children: <><Plus size={15} /> 프로젝트 추가</> } }
export const Disabled = { args: { disabled: true, children: '저장할 수 없음' } }
export const Variants = {
  render: () => <div className="flex flex-wrap items-center gap-3"><Button>Primary</Button><Button variant="dark">Dark</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button></div>,
}
export const IconButtons = {
  render: () => <div className="flex items-center gap-3 rounded-xl bg-white p-4"><IconButton aria-label="설정"><Settings size={18} /></IconButton><IconButton aria-label="삭제" className="hover:bg-rose-50 hover:text-rose-600"><Trash2 size={18} /></IconButton></div>,
}
