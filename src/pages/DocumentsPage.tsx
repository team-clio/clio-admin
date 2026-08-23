import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  useCreateProjectDocument,
  useDeleteProjectDocument,
  useProjectDocuments,
} from "../api/hooks";
import type { Project, ProjectDocument } from "../api/projects";
import {
  Button,
  IconButton,
  NoProjectSelected,
  PageHeader,
  Surface,
} from "../components/ui";

type QueueStatus = "READY" | "UPLOADING" | "SUCCEEDED" | "FAILED";

interface QueuedFile {
  id: string;
  file: File;
  title: string;
  status: QueueStatus;
  error?: string;
}

const acceptedExtensions = [".pdf", ".md", ".markdown"];

function titleFromFilename(filename: string) {
  return filename.replace(/\.(pdf|md|markdown)$/i, "");
}

function isAcceptedFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return acceptedExtensions.some((extension) => lowerName.endsWith(extension));
}

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

export function UploadPanel({
  onUpload,
}: {
  onUpload: (title: string, file: File) => Promise<unknown>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sequenceRef = useRef(0);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState("");
  const uploading = queue.some((item) => item.status === "UPLOADING");
  const pendingCount = queue.filter(
    (item) => item.status === "READY" || item.status === "FAILED",
  ).length;

  const addFiles = (files: File[]) => {
    const accepted = files.filter(isAcceptedFile);
    const rejected = files.length - accepted.length;
    setValidationError(
      rejected > 0
        ? `지원하지 않는 파일 ${rejected}개를 제외했습니다. PDF 또는 Markdown만 올릴 수 있습니다.`
        : "",
    );
    if (accepted.length === 0) return;
    setQueue((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: `${file.name}-${file.lastModified}-${sequenceRef.current++}`,
        file,
        title: titleFromFilename(file.name),
        status: "READY" as const,
      })),
    ]);
  };

  const uploadAll = async () => {
    if (uploading) return;
    const targets = queue.filter(
      (item) =>
        (item.status === "READY" || item.status === "FAILED") &&
        item.title.trim(),
    );
    for (const target of targets) {
      setQueue((current) =>
        current.map((item) =>
          item.id === target.id
            ? { ...item, status: "UPLOADING", error: undefined }
            : item,
        ),
      );
      try {
        await onUpload(target.title.trim(), target.file);
        setQueue((current) =>
          current.map((item) =>
            item.id === target.id ? { ...item, status: "SUCCEEDED" } : item,
          ),
        );
      } catch (reason) {
        setQueue((current) =>
          current.map((item) =>
            item.id === target.id
              ? {
                  ...item,
                  status: "FAILED",
                  error:
                    reason instanceof Error
                      ? reason.message
                      : "업로드하지 못했습니다.",
                }
              : item,
          ),
        );
      }
    }
  };

  return (
    <Surface className="overflow-hidden">
      <div
        className={`m-3 rounded-xl border-2 border-dashed px-5 py-9 text-center transition-colors sm:m-4 sm:py-11 ${
          dragging
            ? "border-clio-500 bg-clio-50"
            : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-clio-600 shadow-sm ring-1 ring-slate-200">
          <UploadCloud size={23} />
        </span>
        <h2 className="mt-4 text-sm font-extrabold text-slate-800">
          파일을 이곳에 끌어 놓으세요
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          PDF 또는 Markdown 파일을 여러 개 선택할 수 있습니다.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          파일 선택
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.md,.markdown,application/pdf,text/markdown"
          className="sr-only"
          aria-label="업로드할 문서 선택"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      {validationError && (
        <p role="alert" className="mx-4 mb-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700">
          {validationError}
        </p>
      )}
      {queue.length > 0 && (
        <div className="border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-extrabold text-slate-700">
                업로드 대기 목록 · {queue.length}개
              </p>
              <p aria-live="polite" className="mt-0.5 text-[11px] text-slate-400">
                {uploading
                  ? "파일을 순서대로 업로드하고 있습니다."
                  : "제목을 확인한 뒤 업로드를 시작하세요."}
              </p>
            </div>
            <Button
              type="button"
              disabled={uploading || pendingCount === 0 || queue.some((item) => !item.title.trim())}
              onClick={uploadAll}
            >
              {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              {uploading ? "업로드 중" : `${pendingCount}개 업로드`}
            </Button>
          </div>
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {queue.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                <span className="mt-2 text-slate-400">
                  {item.status === "UPLOADING" ? (
                    <LoaderCircle size={16} className="animate-spin text-clio-600" />
                  ) : item.status === "SUCCEEDED" ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <FileText size={16} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    value={item.title}
                    maxLength={200}
                    disabled={item.status === "UPLOADING" || item.status === "SUCCEEDED"}
                    aria-label={`${item.file.name} 문서 제목`}
                    onChange={(event) =>
                      setQueue((current) =>
                        current.map((queued) =>
                          queued.id === item.id
                            ? { ...queued, title: event.target.value }
                            : queued,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:border-transparent disabled:bg-transparent disabled:px-0"
                  />
                  <p className={`mt-1 truncate text-[11px] ${item.status === "FAILED" ? "text-rose-600" : "text-slate-400"}`}>
                    {item.status === "FAILED"
                      ? item.error
                      : item.status === "SUCCEEDED"
                        ? `${item.file.name} · 업로드 완료`
                        : item.file.name}
                  </p>
                </div>
                <IconButton
                  type="button"
                  disabled={item.status === "UPLOADING"}
                  aria-label={`${item.file.name} 대기 목록에서 제거`}
                  onClick={() =>
                    setQueue((current) =>
                      current.filter((queued) => queued.id !== item.id),
                    )
                  }
                >
                  <X size={15} />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </Surface>
  );
}

export function DocumentsPage({ project }: { project: Project | null }) {
  const projectId = project?.id ?? null;
  const documentsQuery = useProjectDocuments(projectId);
  const createMutation = useCreateProjectDocument(projectId);
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

  const uploadDocument = (title: string, file: File) =>
    createMutation.mutateAsync({ title, file });

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
        <UploadPanel onUpload={uploadDocument} />
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
