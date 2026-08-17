import { useEffect, useState } from "react";
import type { CreateProjectInput } from "./api/projects";
import {
  useCreateProject,
  useProjects,
  useSidebarCounts,
} from "./api/hooks";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { IssuesPage } from "./pages/IssuesPage";
import { McpPage } from "./pages/McpPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SystemSettingsPage } from "./pages/SystemSettingsPage";
import { BugDebugPage } from "./pages/BugDebugPage";
import { ProjectSettingsPage } from "./pages/ProjectSettingsPage";
import { PcmInspectPage } from "./pages/PcmInspectPage";

type Page =
  | "reports"
  | "issues"
  | "debug"
  | "mcp"
  | "pcm"
  | "project-settings"
  | "system";

const SELECTED_PROJECT_KEY = "clio.selectedProjectId";

function readStoredProjectId(): number | null {
  try {
    const raw = window.localStorage.getItem(SELECTED_PROJECT_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function App() {
  const [page, setPage] = useState<Page>("reports");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    readStoredProjectId,
  );

  const projectsQuery = useProjects();
  const createProjectMutation = useCreateProject();

  // 저장된 프로젝트가 서버에서 삭제된 경우에도 안전하도록,
  // 로드된 프로젝트 목록에 존재하는 선택값만 유효한 것으로 취급한다.
  const validSelectedProjectId =
    projectsQuery.data === undefined
      ? selectedProjectId
      : projectsQuery.data.some((project) => project.id === selectedProjectId)
        ? selectedProjectId
        : null;

  const countsQuery = useSidebarCounts(validSelectedProjectId);

  // 선택한 프로젝트를 localStorage에 영속화해 새로고침 후에도 유지한다.
  useEffect(() => {
    try {
      if (validSelectedProjectId === null) {
        window.localStorage.removeItem(SELECTED_PROJECT_KEY);
      } else {
        window.localStorage.setItem(
          SELECTED_PROJECT_KEY,
          String(validSelectedProjectId),
        );
      }
    } catch {
      // localStorage를 사용할 수 없는 환경(비공개 모드 등)에서는 무시한다.
    }
  }, [validSelectedProjectId]);

  const handleCreateProject = async (input: CreateProjectInput) => {
    const project = await createProjectMutation.mutateAsync(input);
    setSelectedProjectId(project.id);
    return project;
  };

  const selectedProject =
    projectsQuery.data?.find((project) => project.id === validSelectedProjectId) ??
    null;

  const navigate = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
  };

  const sidebarProps = {
    page,
    navigate,
    projects: projectsQuery.data ?? [],
    selectedProjectId: validSelectedProjectId,
    setSelectedProjectId,
    projectsLoading: projectsQuery.isPending,
    projectsError:
      projectsQuery.error instanceof Error ? projectsQuery.error.message : "",
    onCreateProject: handleCreateProject,
    counts: countsQuery.data ?? {},
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <TopBar onMenu={() => setMobileOpen(true)} />
      <div className="flex pt-14">
        <Sidebar {...sidebarProps} className="hidden lg:flex" />
        {mobileOpen && (
          <div className="animate-overlay fixed inset-0 z-50 flex lg:hidden">
            <button
              className="absolute inset-0 bg-slate-950/30"
              aria-label="메뉴 닫기"
              onClick={() => setMobileOpen(false)}
            />
            <Sidebar
              {...sidebarProps}
              className="animate-sidebar relative flex shadow-2xl"
              onClose={() => setMobileOpen(false)}
            />
          </div>
        )}
        <main className="min-w-0 flex-1 lg:ml-60">
          {page === "reports" && (
            <ReportsPage
              key={validSelectedProjectId ?? "none"}
              projectId={validSelectedProjectId}
            />
          )}
          {page === "issues" && (
            <IssuesPage
              key={validSelectedProjectId ?? "none"}
              projectId={validSelectedProjectId}
            />
          )}
          {page === "mcp" && <McpPage />}
          {page === "pcm" && (
            <PcmInspectPage
              key={validSelectedProjectId ?? "none"}
              projectId={validSelectedProjectId}
            />
          )}
          {page === "project-settings" && (
            <ProjectSettingsPage
              key={validSelectedProjectId ?? "none"}
              project={selectedProject}
            />
          )}
          {page === "debug" && (
            <BugDebugPage
              key={validSelectedProjectId ?? "none"}
              projectId={validSelectedProjectId}
            />
          )}
          {page === "system" && <SystemSettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
