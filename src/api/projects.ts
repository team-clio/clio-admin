const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface Project {
  id: string
  name: string
}

interface ProjectsResponse {
  items: Project[]
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || '프로젝트 요청을 처리하지 못했습니다.')
  }

  return response.json() as Promise<T>
}

export async function getProjects() {
  const response = await request<ProjectsResponse>('/api/v1/projects')
  return response.items
}

export function createProject(name: string) {
  return request<Project>('/api/v1/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}
