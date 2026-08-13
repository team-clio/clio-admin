import { useEffect, useState } from "react";
import type { Project } from "./api/projects";
import { createProject, getProjects } from "./api/projects";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { IssuesPage } from "./pages/IssuesPage";
import { McpPage } from "./pages/McpPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SystemSettingsPage } from "./pages/SystemSettingsPage";

type Page = "reports" | "issues" | "mcp" | "system";

function App() {
  const [page, setPage] = useState<Page>("reports");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    let active = true;

    getProjects()
      .then((items) => {
        if (!active) return;
        setProjects(items);
        setSelectedProjectId((current) => current ?? items[0]?.id ?? null);
      })
      .catch((error) => {
        if (active) setProjectsError(error.message);
      })
      .finally(() => {
        if (active) setProjectsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreateProject = async (name: string) => {
    setProjectsError("");
    const project = await createProject(name);
    setProjects((current) =>
      [...current, project].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setSelectedProjectId(project.id);
    return project;
  };

  const navigate = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
  };

  const sidebarProps = {
    page,
    navigate,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    projectsLoading,
    projectsError,
    onCreateProject: handleCreateProject,
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
          {page === "system" && <SystemSettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
