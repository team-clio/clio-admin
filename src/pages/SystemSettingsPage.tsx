import { useEffect, useState } from 'react'
import { AlertTriangle, LoaderCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { getLlmSettings, type CurrentLlmSettings, type LlmProvider } from '../api/system'
import { PageHeader, Surface } from '../components/ui'

export function SystemSettingsPage() {
  const [providers, setProviders] = useState<LlmProvider[]>([])
  const [current, setCurrent] = useState<CurrentLlmSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getLlmSettings().then(({ providers: items, current: settings }) => {
      setProviders(items); setCurrent(settings)
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'LLM 설정을 불러오지 못했습니다.')).finally(() => setLoading(false))
  }, [])

  return <div className="animate-page"><PageHeader eyebrow="SYSTEM" title="시스템 설정" description="서버가 제공하는 LLM 설정 상태를 확인합니다." /><div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8"><Surface className="overflow-hidden"><div className="flex items-center gap-3 border-b border-slate-100 p-6"><span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-clio-600"><Sparkles size={17} /></span><div><h2 className="text-sm font-extrabold text-slate-800">LLM Provider</h2><p className="mt-1 text-xs text-slate-400">`/external-api/v1/system/llm` API 연결 상태</p></div></div><div className="p-6">{loading ? <p className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" /> 설정을 불러오는 중입니다.</p> : error ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="flex items-center gap-2 text-sm font-bold text-amber-800"><AlertTriangle size={17} /> 서버에서 아직 LLM 설정 기능을 제공하지 않습니다.</p><p className="mt-2 text-xs leading-5 text-amber-700">현재 서버 엔드포인트가 501 Not Implemented를 반환합니다. API 구현 전까지 설정 조회와 저장을 사용할 수 없습니다.</p></div> : <div><p className="text-sm font-bold text-slate-700">현재 Provider: {current?.provider?.name ?? '미지정'}</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{providers.map((provider) => <div key={provider.id} className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-bold text-slate-800">{provider.name}</p><p className="mt-1 text-xs text-slate-400">{provider.providerType}</p></div>)}</div></div>}</div></Surface><Surface className="p-6"><div className="flex gap-3"><ShieldAlert className="shrink-0 text-slate-400" size={20} /><div><h2 className="text-sm font-extrabold text-slate-800">관리자 계정</h2><p className="mt-2 text-xs leading-5 text-slate-500">관리자 계정 조회·수정 API가 서버에 정의되어 있지 않아 입력 폼을 제거했습니다. API 계약이 추가되면 이 영역을 연결할 수 있습니다.</p></div></div></Surface></div></div>
}
