import { jsonOptions, request } from "./client";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type RepositoryProvider = "GITHUB" | "GITLAB" | "BITBUCKET";
export type RepositorySyncStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";

export interface ProjectRepository {
  id: number;
  projectId: number;
  provider: RepositoryProvider;
  owner: string;
  name: string;
  url: string;
  defaultBranch: string;
  includePaths: string[];
  excludePaths: string[];
  enabled: boolean;
  syncStatus: RepositorySyncStatus;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectDocumentSyncStatus =
  "PENDING" | "SYNCING" | "SYNCED" | "FAILED" | "DELETING";

export interface ProjectDocument {
  id: number;
  projectId: number;
  title: string;
  originalFilename: string;
  mediaType: string;
  syncStatus: ProjectDocumentSyncStatus;
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface RepositoryInput {
  provider: RepositoryProvider;
  owner: string;
  name: string;
  url: string;
  defaultBranch: string;
  includePaths: string[];
  excludePaths: string[];
  enabled: boolean;
}

interface ProjectsResponse {
  items: Project[];
}

export async function getProjects() {
  const response = await request<ProjectsResponse>("/api/v1/projects");
  return response.items;
}

export function createProject(input: CreateProjectInput) {
  return request<Project>("/api/v1/projects", jsonOptions("POST", input));
}

export function updateProject(
  projectId: number,
  input: Pick<CreateProjectInput, "name" | "description">,
) {
  return request<Project>(
    `/api/v1/projects/${projectId}`,
    jsonOptions("PATCH", input),
  );
}

export function getProjectRepositories(projectId: number) {
  return request<{ items: ProjectRepository[] }>(
    `/api/v1/projects/${projectId}/repositories`,
  ).then((response) => response.items);
}

export function createProjectRepository(
  projectId: number,
  input: RepositoryInput,
) {
  return request<ProjectRepository>(
    `/api/v1/projects/${projectId}/repositories`,
    jsonOptions("POST", input),
  );
}

export function updateProjectRepository(
  projectId: number,
  repositoryId: number,
  input: RepositoryInput,
) {
  return request<ProjectRepository>(
    `/api/v1/projects/${projectId}/repositories/${repositoryId}`,
    jsonOptions("PATCH", input),
  );
}

export function deleteProjectRepository(
  projectId: number,
  repositoryId: number,
) {
  return request<void>(
    `/api/v1/projects/${projectId}/repositories/${repositoryId}`,
    { method: "DELETE" },
  );
}

export function getProjectDocuments(projectId: number) {
  return request<{ items: ProjectDocument[] }>(
    `/api/v1/projects/${projectId}/documents`,
  ).then((response) => response.items);
}

export function createProjectDocument(
  projectId: number,
  title: string,
  file: File,
) {
  const form = new FormData();
  form.append("title", title);
  form.append("file", file);
  return request<ProjectDocument>(`/api/v1/projects/${projectId}/documents`, {
    method: "POST",
    body: form,
  });
}

export function deleteProjectDocument(projectId: number, documentId: number) {
  return request<void>(
    `/api/v1/projects/${projectId}/documents/${documentId}`,
    {
      method: "DELETE",
    },
  );
}
