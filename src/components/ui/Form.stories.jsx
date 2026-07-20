import { Eye, KeyRound } from 'lucide-react'
import { Field, IconButton, Surface } from './index'

export default { title: 'Atoms/Form', parameters: { layout: 'centered' } }

export const TextInput = {
  render: () => <Surface className="w-96 p-6"><Field id="project" label="프로젝트 이름" help="프로젝트를 구분할 수 있는 이름을 입력하세요."><input id="project" placeholder="예: Clio Mobile" className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-clio-500 focus:ring-2 focus:ring-blue-100" /></Field></Surface>,
}

export const SecretInput = {
  render: () => <Surface className="w-96 p-6"><Field id="api" label="API Key" help="API 키는 암호화되어 안전하게 저장됩니다."><div className="relative mt-2"><KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input id="api" type="password" defaultValue="sk-proj-clio" className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm outline-none" /><IconButton className="absolute right-2.5 top-1/2 -translate-y-1/2" aria-label="API 키 보기"><Eye size={15} /></IconButton></div></Field></Surface>,
}

export const Select = {
  render: () => <Surface className="w-96 p-6"><Field id="provider" label="API Provider"><select id="provider" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm"><option>OpenAI</option><option>DeepSeek</option><option>Gemini</option></select></Field></Surface>,
}
