import { FileText, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useDeleteProjectDocument,
  useProjectDocuments,
} from "../api/hooks";
import type { Project, ProjectDocument } from "../api/projects";
import {
  IconButton,
  NoProjectSelected,
  PageHeader,
  Surface,
} from "../components/ui";

const syncLabel = {
  PENDING: "동기화 대기",
  SYNCING: "동기화 중",
  SYNCED: "동기화 완료",
  FAILED: "동기화 실패",
  DELETING: "삭제 동기화 중",
};

const syncStyle = {
  PENDING: "bg-amber-50 text-amber-700",
  SYNCING: "bg-blue-50 text-blue-700",
  SYNCED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-rose-50 text-rose-700",
  DELETING: "bg-slate-100 text-slate-600",
};

function formatMediaType(mediaType: string) {
  if (mediaType === "application/pdf") return "PDF";
  return "Markdown";
}

function DocumentList({
  documents,
  deleting,
  onDelete,
}: {
  documents: ProjectDocument[];
  deleting: boolean;
  onDelete: (document: ProjectDocument) => void;
}) {
  if (documents.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <FileText size={23} />
        </span>
        <p className="mt-4 text-sm font-extrabold text-slate-800">
          아직 등록된 문서가 없습니다
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          제품 요구사항이나 설계 문서를 추가하면 Agent가 분석에 활용합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {documents.map((document) => (
        <article
          key={document.id}
          className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <FileText size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="max-w-full truncate text-sm font-extrabold text-slate-800">
                {document.title}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${syncStyle[document.syncStatus]}`}
              >
                {syncLabel[document.syncStatus]}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-400">
              {document.originalFilename}
              <span className="hidden sm:inline">
                {` · ${formatMediaType(document.mediaType)} · ${new Date(document.createdAt).toLocaleString("ko-KR")}`}
              </span>
            </p>
          </div>
          <IconButton
            disabled={deleting || document.syncStatus === "DELETING"}
            onClick={() => onDelete(document)}
            aria-label={`${document.title} 삭제`}
            className="shrink-0 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
          </IconButton>
        </article>
      ))}
    </div>
  );
}

export function DocumentsPage({ project }: { project: Project | null }) {
  const projectId = project?.id ?? null;
  const documentsQuery = useProjectDocuments(projectId);
  const deleteMutation = useDeleteProjectDocument(projectId);
  const [error, setError] = useState("");

  if (!project) {
    return (
      <div className="animate-page">
        <PageHeader
          eyebrow="PROJECT"
          title="문서"
          description="Agent가 분석에 참고할 프로젝트 문서를 관리합니다."
        />
        <NoProjectSelected />
      </div>
    );
  }

  const documents = documentsQuery.data ?? [];
  const queryError =
    documentsQuery.error instanceof Error ? documentsQuery.error.message : "";

  const removeDocument = async (document: ProjectDocument) => {
    if (!window.confirm(`${document.title} 문서를 삭제할까요?`)) return;
    setError("");
    try {
      await deleteMutation.mutateAsync(document.id);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "문서를 삭제하지 못했습니다.",
      );
    }
  };

  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="PROJECT DOCUMENTS"
        title="문서"
        description={`${project.name}의 분석 맥락으로 사용할 파일을 관리합니다.`}
      >
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
          {documents.length.toLocaleString()}개 문서
        </span>
      </PageHeader>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Surface className="overflow-hidden border-dashed">
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-extrabold text-slate-700">
              업로드 영역을 준비하고 있습니다
            </p>
          </div>
        </Surface>
        <Surface className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">파일 목록</h2>
              <p className="mt-1 text-xs text-slate-400">
                등록된 문서와 Agent 동기화 상태를 확인합니다.
              </p>
            </div>
          </div>
          {(error || queryError) && (
            <p role="alert" className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-xs font-bold text-rose-700">
              {error || queryError}
            </p>
          )}
          {documentsQuery.isPending ? (
            <p className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
              <LoaderCircle size={16} className="animate-spin" />
              문서를 불러오는 중입니다.
            </p>
          ) : (
            <DocumentList
              documents={documents}
              deleting={deleteMutation.isPending}
              onDelete={removeDocument}
            />
          )}
        </Surface>
      </div>
    </div>
  );
}
