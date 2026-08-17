import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  LoaderCircle,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { Fragment, type ReactNode, useMemo, useState } from "react";
import {
  useCodeEvidence,
  useIssue,
  useIssues,
  useIssueStats,
  useLatestIssueAnalysis,
  useUpdateIssue,
} from "../api/hooks";
import type {
  CodeEvidenceFile,
  CodeEvidenceResponse,
  IssueAnalysisSnapshot,
  IssueDetail,
  IssueStatus,
  LatestIssueAnalysis,
  Priority,
} from "../api/issues";
import {
  Button,
  IconButton,
  NoProjectSelected,
  PageHeader,
} from "../components/ui";

type IssueTab = "overview" | "analysis" | "evidence" | "bugs";

const statusLabel: Record<IssueStatus, string> = {
  OPEN: "열림",
  IN_PROGRESS: "진행 중",
  RESOLVED: "해결됨",
  CLOSED: "닫힘",
};
const statusStyle: Record<IssueStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-500",
};
const statusFilters: Array<{ id: IssueStatus | "ALL"; label: string }> = [
  { id: "ALL", label: "전체" },
  { id: "OPEN", label: "열림" },
  { id: "IN_PROGRESS", label: "진행 중" },
  { id: "RESOLVED", label: "해결됨" },
  { id: "CLOSED", label: "닫힘" },
];
const sortOptions: Array<{ value: string; label: string }> = [
  { value: "riskScore,desc", label: "위험도 높은 순" },
  { value: "importanceScore,desc", label: "중요도 높은 순" },
  { value: "lastSeenAt,desc", label: "최신 활동순" },
  { value: "firstSeenAt,desc", label: "최초 발생 최신순" },
  { value: "updatedAt,desc", label: "최근 수정순" },
  { value: "createdAt,desc", label: "생성 최신순" },
  { value: "bugCount,desc", label: "버그 많은 순" },
];
const priorityStyle: Record<Priority, string> = {
  P0: "bg-rose-50 text-rose-600",
  P1: "bg-orange-50 text-orange-600",
  P2: "bg-amber-50 text-amber-600",
  P3: "bg-blue-50 text-blue-600",
  P4: "bg-slate-100 text-slate-500",
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
const formatConfidence = (value: number | null) =>
  value === null ? "—" : `${Math.round(value <= 1 ? value * 100 : value)}%`;

type EvidenceItem = NonNullable<IssueAnalysisSnapshot["evidence"]>[number];
const isCodeEvidence = (item: EvidenceItem) =>
  Boolean(
    item.repository_id || item.source_id || item.file_path || item.location,
  );

export function IssuesPage({ projectId }: { projectId: number | null }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<IssueTab>("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "ALL">("ALL");
  const [sort, setSort] = useState("riskScore,desc");

  const issuesQuery = useIssues(projectId, 0, 20, sort);
  const statsQuery = useIssueStats(projectId);
  const detailQuery = useIssue(projectId, selectedId);
  const analysisQuery = useLatestIssueAnalysis(projectId, selectedId);
  const codeEvidenceQuery = useCodeEvidence(projectId, selectedId);
  const updateIssueMutation = useUpdateIssue(projectId, selectedId);

  const items = useMemo(
    () => issuesQuery.data?.items ?? [],
    [issuesQuery.data],
  );
  const stats = statsQuery.data ?? null;
  const loading = issuesQuery.isPending;
  const error =
    (issuesQuery.error instanceof Error ? issuesQuery.error.message : "") ||
    (updateIssueMutation.error instanceof Error
      ? updateIssueMutation.error.message
      : "");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((issue) => {
      if (statusFilter !== "ALL" && issue.status !== statusFilter) return false;
      if (!q) return true;
      return (
        issue.title.toLowerCase().includes(q) ||
        (issue.summary ?? "").toLowerCase().includes(q) ||
        `iss-${issue.id}`.includes(q) ||
        String(issue.id).includes(q)
      );
    });
  }, [items, query, statusFilter]);

  if (projectId === null) {
    return (
      <div className="animate-page flex min-h-[calc(100vh-3.5rem)] flex-col">
        <PageHeader
          eyebrow="PRIORITIZED QUEUE"
          title="이슈"
          description="서버에서 계산된 우선순위와 연결 버그를 확인합니다."
        />
        <div className="flex-1">
          <NoProjectSelected />
        </div>
      </div>
    );
  }

  const changeStatus = (status: IssueStatus) => {
    if (selectedId === null) return;
    updateIssueMutation.mutate(status);
  };

  return (
    <div className="animate-page flex min-h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        eyebrow="PRIORITIZED QUEUE"
        title="이슈"
        description="서버에서 계산된 우선순위와 연결 버그를 확인합니다."
      >
        {stats && (
          <div className="flex gap-3 text-xs font-bold text-slate-600">
            <span>열림 {stats.openIssues}</span>
            <span>진행 {stats.inProgressIssues}</span>
            <span>해결 {stats.resolvedIssues}</span>
          </div>
        )}
      </PageHeader>
      <div className="flex-1">
        {error && (
          <div className="px-4 pt-4 lg:px-8">
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-700"
            >
              <AlertCircle size={15} />
              {error}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
          <div>
            <p className="text-sm font-bold text-slate-800">작업 큐</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {loading
                ? "불러오는 중..."
                : `열린 이슈 ${stats?.openIssues ?? 0} · 전체 ${stats?.totalIssues ?? items.length}`}
            </p>
          </div>
          <span className="rounded-full bg-clio-50 px-2.5 py-1 text-xs font-bold text-clio-700">
            {filteredItems.length}
          </span>
        </div>
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all duration-200 focus-within:border-clio-500 focus-within:ring-2 focus-within:ring-blue-100 sm:max-w-xs">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="제목, 요약, ID로 검색"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex gap-1.5">
              {statusFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === filter.id ? "bg-clio-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <span
              className="h-5 w-px shrink-0 bg-slate-200"
              aria-hidden="true"
            />
            <label className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-500">
              정렬
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-clio-500"
                aria-label="정렬 기준"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {!loading && items.length === 0 ? (
          <div className="grid h-80 place-items-center bg-white text-sm text-slate-400">
            {projectId
              ? "등록된 이슈가 없습니다."
              : "프로젝트를 먼저 선택하세요."}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="grid h-64 place-items-center bg-white text-sm text-slate-400">
            조건에 맞는 이슈가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white">
            {filteredItems.map((issue) => (
              <button
                key={issue.id}
                onClick={() => {
                  setActiveTab("overview");
                  setSelectedId(issue.id);
                }}
                className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 lg:px-8"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-md px-2 py-1 text-xs font-extrabold ${issue.priority ? priorityStyle[issue.priority] : "bg-slate-100 text-slate-400"}`}
                >
                  {issue.priority ?? "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-800">
                    {issue.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="font-mono">ISS-{issue.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusStyle[issue.status]}`}
                    >
                      {statusLabel[issue.status]}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {issue.bugCount}
                    </span>
                    <span>{issue.assigneeName ?? "담당자 미지정"}</span>
                    <span>{formatDate(issue.lastSeenAt)}</span>
                  </div>
                </div>
                <ChevronRight
                  size={17}
                  className="mt-1 shrink-0 text-slate-300"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedId !== null &&
        (detailQuery.data !== undefined || detailQuery.isPending) && (
          <div className="scrollbar-subtle fixed bottom-0 left-0 right-0 top-14 z-[70] overflow-y-auto bg-white lg:left-60">
            <IssueDetailPanel
              detail={detailQuery.data ?? null}
              detailLoading={detailQuery.isPending}
              analysis={analysisQuery.data ?? null}
              codeEvidence={codeEvidenceQuery.data ?? null}
              analysisLoading={analysisQuery.isPending}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              updating={updateIssueMutation.isPending}
              changeStatus={changeStatus}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
    </div>
  );
}

function IssueDetailPanel({
  detail,
  detailLoading,
  analysis,
  codeEvidence,
  analysisLoading,
  activeTab,
  setActiveTab,
  updating,
  changeStatus,
  onClose,
}: {
  detail: IssueDetail | null;
  detailLoading: boolean;
  analysis: LatestIssueAnalysis | null;
  codeEvidence: CodeEvidenceResponse | null;
  analysisLoading: boolean;
  activeTab: IssueTab;
  setActiveTab: (tab: IssueTab) => void;
  updating: boolean;
  changeStatus: (status: IssueStatus) => void;
  onClose?: () => void;
}) {
  if (detailLoading || !detail)
    return (
      <LoaderCircle className="mx-auto mt-20 animate-spin text-clio-600" />
    );

  const issueAnalysis = analysis?.issueAnalysis ?? null;
  const evidence = issueAnalysis?.evidence ?? [];
  const tabs: Array<{ id: IssueTab; label: string; count?: number }> = [
    { id: "overview", label: "개요" },
    { id: "analysis", label: "AI 분석" },
    {
      id: "evidence",
      label: "코드 근거",
      count: evidence.filter(isCodeEvidence).length,
    },
    { id: "bugs", label: "연결 버그", count: detail.bugs.length },
  ];

  return (
    <div className="animate-detail flex min-h-full flex-col">
      <header className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-5 pt-5">
          <div className="flex items-start gap-3">
            {onClose && (
              <IconButton
                className="-ml-1 mt-0.5"
                aria-label="이슈 목록으로 돌아가기"
                onClick={onClose}
              >
                <ArrowLeft size={18} />
              </IconButton>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-slate-400">
                ISS-{detail.id} · {statusLabel[detail.status]}
              </p>
              <h2 className="mt-1 text-lg font-bold leading-6 text-slate-900">
                {detail.title}
              </h2>
            </div>
            <IssueAction
              status={detail.status}
              updating={updating}
              changeStatus={changeStatus}
            />
          </div>
          <div
            role="tablist"
            aria-label="이슈 상세 보기"
            className="mt-5 flex gap-4 overflow-x-auto"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`issue-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`issue-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 pb-3 text-xs font-bold transition-colors ${activeTab === tab.id ? "border-clio-600 text-clio-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div
        id={`issue-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`issue-tab-${activeTab}`}
        className={
          activeTab === "evidence"
            ? "flex min-h-0 w-full flex-1 flex-col"
            : "mx-auto w-full max-w-4xl p-5 lg:p-8"
        }
      >
        {activeTab === "overview" && (
          <>
            <IssueSummaryMarkdown markdown={detail.summary} />
            <OverviewAnalysis analysis={issueAnalysis} loading={analysisLoading} />
            <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Info label="통합 버그" value={`${detail.bugCount}개`} />
              <Info
                label="AI 신뢰도"
                value={formatConfidence(detail.aiConfidence)}
              />
              <Info label="우선순위" value={detail.priority ?? "—"} />
              <Info
                label="위험도"
                value={detail.riskScore != null ? `${detail.riskScore}점` : "—"}
              />
              <Info label="담당자" value={detail.assigneeName ?? "미지정"} />
              <Info label="심각도" value={detail.severity ?? "—"} />
            </dl>
          </>
        )}
        {activeTab === "analysis" && (
          <CanonicalAnalysisSection
            analysis={issueAnalysis}
            loading={analysisLoading}
            includeEvidence={false}
          />
        )}
        {activeTab === "evidence" && (
          <CodeEvidenceIde data={codeEvidence} fallback={evidence} />
        )}
        {activeTab === "bugs" && <LinkedBugs bugs={detail.bugs} />}
      </div>
    </div>
  );
}

const EMPTY_FILES: CodeEvidenceFile[] = [];

type FileTreeNode = {
  name: string;
  path: string;
  kind: "dir" | "file";
  fileIndex?: number;
  children?: FileTreeNode[];
};

function buildFileTree(files: CodeEvidenceFile[]): FileTreeNode[] {
  const root: FileTreeNode = { name: "", path: "", kind: "dir", children: [] };
  for (let index = 0; index < files.length; index++) {
    const parts = files[index].path.split("/").filter(Boolean);
    if (!parts.length) continue;
    let node = root;
    parts.forEach((part, depth) => {
      const isLeaf = depth === parts.length - 1;
      const path = parts.slice(0, depth + 1).join("/");
      let child = node.children?.find((item) => item.name === part);
      if (!child) {
        child = { name: part, path, kind: "dir", children: [] };
        node.children = node.children ?? [];
        node.children.push(child);
      }
      if (isLeaf) {
        child.kind = "file";
        child.fileIndex = index;
      }
      node = child;
    });
  }
  return sortFileTree(root.children ?? []);
}

function sortFileTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes
    .map((node) =>
      node.children ? { ...node, children: sortFileTree(node.children) } : node,
    )
    .sort((a, b) =>
      a.kind === b.kind
        ? a.name.localeCompare(b.name)
        : a.kind === "dir"
          ? -1
          : 1,
    );
}

function FileTree({
  nodes,
  selectedIndex,
  onSelect,
  collapsed,
  onToggle,
  indent = false,
}: {
  nodes: FileTreeNode[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
  indent?: boolean;
}) {
  return (
    <ul role={indent ? "group" : "tree"} className={indent ? "pl-3" : ""}>
      {nodes.map((node) => {
        if (node.kind === "dir") {
          const isCollapsed = collapsed.has(node.path);
          return (
            <li key={node.path} role="treeitem" aria-expanded={!isCollapsed}>
              <button
                onClick={() => onToggle(node.path)}
                className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left font-mono text-xs text-slate-600 hover:bg-white hover:text-slate-800"
              >
                <ChevronRight
                  size={12}
                  className={`shrink-0 text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                />
                {isCollapsed ? (
                  <Folder size={13} className="shrink-0 text-slate-400" />
                ) : (
                  <FolderOpen size={13} className="shrink-0 text-slate-400" />
                )}
                <span className="truncate">{node.name}</span>
              </button>
              {!isCollapsed && node.children && (
                <FileTree
                  nodes={node.children}
                  selectedIndex={selectedIndex}
                  onSelect={onSelect}
                  collapsed={collapsed}
                  onToggle={onToggle}
                  indent
                />
              )}
            </li>
          );
        }
        return (
          <li key={node.path} role="treeitem">
            <button
              onClick={() =>
                node.fileIndex !== undefined && onSelect(node.fileIndex)
              }
              className={`flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left font-mono text-xs transition-colors ${node.fileIndex === selectedIndex ? "bg-clio-50 text-clio-700 ring-1 ring-inset ring-clio-100" : "text-slate-600 hover:bg-white hover:text-slate-800"}`}
            >
              <span className="w-3 shrink-0" aria-hidden="true" />
              <FileCode size={13} className="shrink-0 text-slate-400" />
              <span className="truncate">{node.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CodeEvidenceIde({
  data,
  fallback,
}: {
  data: CodeEvidenceResponse | null;
  fallback: NonNullable<IssueAnalysisSnapshot["evidence"]>;
}) {
  const [selected, setSelected] = useState(0);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const files = data?.files ?? EMPTY_FILES;
  const tree = useMemo(() => buildFileTree(files), [files]);
  if (!files.length)
    return (
      <>
        <p className="text-sm text-slate-400">
          구조화된 코드 위치가 있는 최신 분석 결과가 없습니다.
        </p>
        <CodeEvidence evidence={fallback} />
      </>
    );
  const selectedIndex = Math.min(selected, files.length - 1);
  const file = files[selectedIndex];
  const lines = file.content.split("\n").map((line) => {
    const match = line.match(/^(\d+):\s?(.*)$/);
    return { number: Number(match?.[1]), text: match?.[2] ?? line };
  });
  const toggleDirectory = (path: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[15rem_minmax(0,1fr)] bg-white">
      <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-3">
        <p className="mb-3 px-1 text-[10px] font-bold tracking-widest text-slate-400">
          EVIDENCE FILES
        </p>
        <FileTree
          nodes={tree}
          selectedIndex={selectedIndex}
          onSelect={setSelected}
          collapsed={collapsed}
          onToggle={toggleDirectory}
        />
      </aside>
      <section className="flex min-h-0 min-w-0 flex-col">
        <div className="shrink-0 truncate border-b border-slate-200 bg-white px-4 py-3 font-mono text-[11px] text-slate-600">
          {file.path}{" "}
          <span className="text-slate-400">@ {file.commit.slice(0, 12)}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-white py-2 font-mono text-xs leading-6">
          {lines.map((line) => {
            const citation = file.citations.find(
              (item) =>
                line.number >= item.start_line && line.number <= item.end_line,
            );
            return (
              <div
                key={line.number}
                className={
                  citation ? "bg-clio-50 text-slate-800" : "text-slate-600"
                }
              >
                <span className="inline-block w-14 select-none border-r border-slate-100 pr-3 text-right text-slate-400">
                  {line.number}
                </span>
                <span className="whitespace-pre pl-4">{line.text}</span>
                {citation?.observation &&
                  line.number === citation.start_line && (
                    <p className="flex gap-2 items-center ml-14 text-red-500 border-clio-500 bg-red-100 rounded-lg px-3 py-1 text-xs leading-5 text-clio-800">
                      <ArrowUp className="size-4" />
                      {citation.observation}
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function IssueAction({
  status,
  updating,
  changeStatus,
}: {
  status: IssueStatus;
  updating: boolean;
  changeStatus: (status: IssueStatus) => void;
}) {
  if (status === "OPEN")
    return (
      <Button
        className="shrink-0 px-3 py-2"
        onClick={() => changeStatus("IN_PROGRESS")}
        disabled={updating}
      >
        처리 시작
      </Button>
    );
  if (status === "IN_PROGRESS")
    return (
      <Button
        className="shrink-0 px-3 py-2"
        onClick={() => changeStatus("RESOLVED")}
        disabled={updating}
      >
        해결 처리
      </Button>
    );
  if (status === "RESOLVED")
    return (
      <Button
        className="shrink-0 px-3 py-2"
        variant="secondary"
        onClick={() => changeStatus("OPEN")}
        disabled={updating}
      >
        다시 열기
      </Button>
    );
  return null;
}

function LinkedBugs({ bugs }: { bugs: IssueDetail["bugs"] }) {
  if (!bugs.length)
    return <p className="text-sm text-slate-400">연결된 버그가 없습니다.</p>;
  return (
    <div className="space-y-3">
      {bugs.map((bug) => (
        <article
          key={bug.id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <p className="text-sm font-bold text-slate-800">{bug.title}</p>
          <p className="mt-2 font-mono text-[11px] text-slate-400">
            BUG-{bug.id} · {bug.errorType ?? "오류 유형 없음"}
          </p>
          {bug.topStackFrame && (
            <p className="mt-2 rounded bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
              {bug.topStackFrame}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-400">
            {formatDate(bug.occurredAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

function IssueSummaryMarkdown({ markdown }: { markdown: string | null }) {
  if (!markdown)
    return (
      <p className="mt-2 text-sm leading-6 text-slate-600">
        요약이 아직 없습니다.
      </p>
    );

  const blocks: ReactNode[] = [];
  const lines = markdown.split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p
        key={`paragraph-${blocks.length}`}
        className="mt-3 text-sm leading-6 text-slate-600"
      >
        {inlineMarkdown(paragraph.join(" "))}
      </p>,
    );
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul
        key={`list-${blocks.length}`}
        className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600"
      >
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{inlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3
          key={`heading-${blocks.length}`}
          className="mt-5 text-sm font-bold text-slate-800"
        >
          {inlineMarkdown(heading[1])}
        </h3>,
      );
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();

  return <div className="mt-2">{blocks}</div>;
}

function inlineMarkdown(value: string) {
  return value
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`"))
        return (
          <code
            key={index}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      return <Fragment key={index}>{part}</Fragment>;
    });
}

function OverviewAnalysis({
  analysis,
  loading,
}: {
  analysis: IssueAnalysisSnapshot | null;
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <LoaderCircle className="animate-spin text-clio-600" size={18} />
      </div>
    );
  if (!analysis) return null;
  const review = analysis.review.required || analysis.status !== "COMPLETED";
  const action = analysis.recommended_action;
  return (
    <section className="mt-6 rounded-2xl border border-clio-100 bg-clio-50/40 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-clio-600 shadow-sm">
          <Sparkles size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold tracking-wide text-clio-700">AI 결론</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${review ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
              {review ? "검토 필요" : "실행 가능"}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-extrabold leading-5 text-slate-900">
            {analysis.executive_summary.one_line}
          </h3>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {analysis.executive_summary.impact}
          </p>
          {action ? (
            <div className="mt-4 rounded-xl border border-white bg-white p-3 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <Target size={13} className="text-clio-600" /> 추천 조치
              </p>
              <p className="mt-1 text-xs font-bold text-slate-800">{action.title}</p>
            </div>
          ) : null}
        </div>
      </div>
      {review && analysis.review.reasons.length ? (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          {analysis.review.reasons.map((reason) => <p key={reason}>{reason}</p>)}
        </div>
      ) : null}
    </section>
  );
}

function CanonicalAnalysisSection({
  analysis,
  loading,
  includeEvidence = true,
}: {
  analysis: IssueAnalysisSnapshot | null;
  loading: boolean;
  includeEvidence?: boolean;
}) {
  if (loading)
    return (
      <section className="mt-6">
        <h3 className="text-xs font-bold text-slate-500">AI 분석</h3>
        <LoaderCircle className="mx-auto mt-5 animate-spin text-clio-600" />
      </section>
    );
  if (!analysis)
    return (
      <section className="mt-6">
        <h3 className="text-xs font-bold text-slate-500">AI 분석</h3>
        <p className="mt-2 text-xs text-slate-400">분석 결과가 없습니다.</p>
      </section>
    );
  const action = analysis.recommended_action;
  const review = analysis.review.required || analysis.status !== "COMPLETED";
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-clio-600">ANALYSIS</p>
          <h3 className="mt-1 text-base font-extrabold text-slate-900">판단과 실행 계획</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${review ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          {review ? "검토 필요" : "분석 완료"}
        </span>
      </div>
      <div className="rounded-2xl border border-clio-100 bg-clio-50/40 p-5">
        <p className="text-xs font-bold text-clio-700">결론</p>
        <h4 className="mt-2 text-sm font-extrabold leading-5 text-slate-900">
          {analysis.executive_summary.one_line}
        </h4>
        <p className="mt-2 text-xs leading-5 text-slate-600">{analysis.executive_summary.impact}</p>
        <p className="mt-3 text-[11px] font-bold text-slate-400">
          신뢰도 {Math.round(analysis.executive_summary.confidence * 100)}%
        </p>
      </div>
      {action ? (
        <section>
          <SectionHeading icon={<Target size={14} />} title="추천 조치" />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-800">{action.title}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{action.rationale}</p>
            {action.targets?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {action.targets.map((target) => (
                  <code key={`${target.file_path}-${target.symbol ?? ""}`} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                    {target.file_path}{target.symbol ? ` · ${target.symbol}` : ""}
                  </code>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      <AnalysisList title="근본 원인" values={analysis.root_cause} />
      {analysis.verification_plan ? (
        <section>
          <SectionHeading title="검증 계획" />
          <AnalysisList title="실행 단계" values={analysis.verification_plan.steps} />
          <AnalysisList title="완료 기준" values={analysis.verification_plan.acceptance_criteria} />
        </section>
      ) : null}
      {analysis.risks.length ? (
        <section>
          <SectionHeading icon={<ShieldAlert size={14} />} title="위험 및 완화책" />
          <div className="space-y-2">
            {analysis.risks.map((risk, index) => (
              <div key={`${risk.risk}-${index}`} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-xs leading-5">
                <p className="font-bold text-amber-900">{risk.risk}</p>
                <p className="mt-1 text-amber-800">완화: {risk.mitigation}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {review && analysis.review.reasons.length ? (
        <section className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <p className="font-bold">사람이 확인해야 하는 항목</p>
          {analysis.review.reasons.map((reason) => <p key={reason} className="mt-1">{reason}</p>)}
        </section>
      ) : null}
      {includeEvidence && <CodeEvidence evidence={analysis.evidence ?? []} />}
    </section>
  );
}

function SectionHeading({ icon, title }: { icon?: ReactNode; title: string }) {
  return <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">{icon}{title}</h4>;
}

function AnalysisSection({
  analysis,
  loading,
  includeEvidence = true,
}: {
  analysis: IssueAnalysisSnapshot | null;
  loading: boolean;
  includeEvidence?: boolean;
}) {
  if (loading)
    return (
      <section className="mt-6">
        <h3 className="text-xs font-bold text-slate-500">AI 분석</h3>
        <LoaderCircle className="mx-auto mt-5 animate-spin text-clio-600" />
      </section>
    );
  if (!analysis)
    return (
      <section className="mt-6">
        <h3 className="text-xs font-bold text-slate-500">AI 분석</h3>
        <p className="mt-2 text-xs text-slate-400">분석 결과가 없습니다.</p>
      </section>
    );

  const review = analysis.status !== "COMPLETED";
  const findings =
    analysis.findings
      ?.map((finding) =>
        typeof finding === "string"
          ? finding
          : (finding.fact ?? finding.statement),
      )
      .filter(Boolean) ?? [];
  const hypotheses = analysis.hypotheses ?? [];
  const plan = analysis.resolution_plan;
  const riskAssessment = analysis.risk_assessment;

  return (
    <section className="mt-6 border-t border-slate-200 pt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-slate-500">AI 분석</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${review ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {review ? "검토 필요" : "분석 완료"}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        신뢰도{" "}
        {analysis.confidence === undefined
          ? "—"
          : `${Math.round(analysis.confidence * 100)}%`}
      </p>
      {analysis.warnings?.length ? (
        <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          {analysis.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
      <AnalysisList title="확인된 원인 및 관찰" values={findings} />
      {hypotheses.length ? (
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-600">원인 가설</h4>
          <div className="mt-2 space-y-2">
            {hypotheses.map((hypothesis, index) => {
              const text =
                typeof hypothesis === "string"
                  ? hypothesis
                  : (hypothesis.hypothesis ??
                    hypothesis.statement ??
                    "가설 설명 없음");
              const confidence =
                typeof hypothesis === "string"
                  ? undefined
                  : hypothesis.confidence;
              return (
                <div
                  key={`${text}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <p className="text-xs leading-5 text-slate-700">{text}</p>
                  {confidence !== undefined && (
                    <p className="mt-1 text-[11px] font-bold text-slate-400">
                      신뢰도 {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <AnalysisList
        title="해결 계획"
        values={
          plan?.steps
            ?.map((step) =>
              typeof step === "string"
                ? step
                : step.action && step.details
                  ? `${step.action}: ${step.details}`
                  : (step.action ??
                    step.details ??
                    step.description ??
                    step.title),
            )
            .filter(Boolean) ?? []
        }
      />
      <AnalysisList
        title="완료 기준"
        values={plan?.acceptance_criteria ?? []}
      />
      {plan?.risks?.length ? (
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-600">예상 위험 및 완화책</h4>
          <div className="mt-2 space-y-2">
            {plan.risks.map((risk, index) => {
              const text = typeof risk === "string" ? risk : risk.risk;
              if (!text) return null;
              return (
                <div
                  key={`${text}-${index}`}
                  className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs leading-5"
                >
                  <p className="font-semibold text-amber-900">{text}</p>
                  {typeof risk !== "string" && risk.mitigation ? (
                    <p className="mt-1 text-amber-800">
                      완화: {risk.mitigation}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {riskAssessment ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-slate-600">위험도 평가</h4>
            <span className="text-xs font-bold text-slate-500">
              {riskAssessment.risk_score === undefined
                ? "—"
                : `${riskAssessment.risk_score}점`}
              {riskAssessment.priority ? ` · ${riskAssessment.priority}` : ""}
            </span>
          </div>
          {riskAssessment.rationale ? (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {riskAssessment.rationale}
            </p>
          ) : null}
          {riskAssessment.factors?.length ? (
            <div className="mt-2 space-y-2">
              {riskAssessment.factors.map((factor, index) => (
                <div
                  key={`${factor.name ?? "factor"}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-700">
                      {factor.name ?? "평가 요인"}
                    </p>
                    {factor.score !== undefined ? (
                      <span className="text-[11px] font-bold text-slate-400">
                        {factor.score}점
                      </span>
                    ) : null}
                  </div>
                  {factor.rationale ? (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {factor.rationale}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {includeEvidence && <CodeEvidence evidence={analysis.evidence ?? []} />}
    </section>
  );
}

void AnalysisSection;

function AnalysisList({
  title,
  values,
}: {
  title: string;
  values: Array<string | undefined>;
}) {
  const present = values.filter((value): value is string => Boolean(value));
  if (!present.length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold text-slate-600">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {present.map((value, index) => (
          <li
            key={`${value}-${index}`}
            className="flex gap-2 text-xs leading-5 text-slate-600"
          >
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-clio-600" />
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CodeEvidence({
  evidence,
}: {
  evidence: NonNullable<IssueAnalysisSnapshot["evidence"]>;
}) {
  const codeEvidence = evidence.filter(isCodeEvidence);
  if (!codeEvidence.length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold text-slate-600">코드 근거</h4>
      <div className="mt-2 space-y-2">
        {codeEvidence.map((item, index) => {
          const location = item.location;
          const path =
            item.file_path ??
            (typeof location === "string" ? location : location?.path) ??
            "경로 없음";
          const start =
            typeof location === "string" ? undefined : location?.start_line;
          const end =
            typeof location === "string" ? undefined : location?.end_line;
          const commit = item.commit ?? item.source_revision;
          const repositoryId = item.repository_id ?? item.source_id;
          return (
            <div
              key={`${path}-${index}`}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <p className="break-all font-mono text-[11px] font-bold text-slate-700">
                {path}
                {start
                  ? `:${start}${end && end !== start ? `-${end}` : ""}`
                  : ""}
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-400">
                {commit ? commit.slice(0, 12) : "commit 없음"}
                {repositoryId ? ` · repository ${repositoryId}` : ""}
              </p>
              {item.observation && (
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {item.observation}
                </p>
              )}
              {item.snippet && (
                <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-2 text-[10px] leading-4 text-slate-100">
                  {item.snippet}
                </pre>
              )}
              {item.statement && (
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {item.statement}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 text-xs font-bold text-slate-700">{value}</dd>
    </div>
  );
}
