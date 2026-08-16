import { useState } from "react";
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

function App() {
  const [page, setPage] = useState<Page>("reports");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const projectsQuery = useProjects();
  const countsQuery = useSidebarCounts(selectedProjectId);
  const createProjectMutation = useCreateProject();

  const handleCreateProject = async (input: CreateProjectInput) => {
    const project = await createProjectMutation.mutateAsync(input);
    setSelectedProjectId(project.id);
    return project;
  };

  const selectedProject =
    projectsQuery.data?.find((project) => project.id === selectedProjectId) ??
    null;

  const navigate = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
  };

  const sidebarProps = {
    page,
    navigate,
    projects: projectsQuery.data ?? [],
    selectedProjectId,
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
              key={selectedProjectId ?? "none"}
              projectId={selectedProjectId}
            />
          )}
          {page === "issues" && (
            <IssuesPage
              key={selectedProjectId ?? "none"}
              projectId={selectedProjectId}
            />
          )}
          {page === "mcp" && <McpPage />}
          {page === "pcm" && (
            <PcmInspectPage
              key={selectedProjectId ?? "none"}
              projectId={selectedProjectId}
            />
          )}
          {page === "project-settings" && (
            <ProjectSettingsPage
              key={selectedProjectId ?? "none"}
              project={selectedProject}
            />
          )}
          {page === "debug" && (
            <BugDebugPage
              key={selectedProjectId ?? "none"}
              projectId={selectedProjectId}
            />
          )}
          {page === "system" && <SystemSettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
