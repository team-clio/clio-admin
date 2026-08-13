import { jsonOptions, request } from './client'

export interface Project {
  id: number
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface ProjectsResponse {
  items: Project[]
}

export async function getProjects() {
  const response = await request<ProjectsResponse>('/api/v1/projects')
  return response.items
}

export function createProject(name: string) {
  return request<Project>('/api/v1/projects', jsonOptions('POST', { name }))
}
