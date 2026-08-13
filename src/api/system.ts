import { request } from './client'

export interface LlmProvider {
  id: number
  name: string
  providerType: string
  enabled: boolean
}

export interface CurrentLlmSettings {
  provider: LlmProvider | null
  models: unknown[]
}

export async function getLlmSettings() {
  const [providers, current] = await Promise.all([
    request<{ items: LlmProvider[] }>('/external-api/v1/system/llm/providers'),
    request<CurrentLlmSettings>('/external-api/v1/system/llm/current'),
  ])
  return { providers: providers.items, current }
}
