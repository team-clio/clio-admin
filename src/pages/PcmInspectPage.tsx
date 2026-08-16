import {
  BookOpen,
  Braces,
  BrainCircuit,
  FileCode2,
  Link2,
  LoaderCircle,
  SearchX,
  ServerCog,
} from "lucide-react";
import { useState } from "react";
import {
  usePcmKnowledge,
  usePcmKnowledgeDetail,
  usePcmSnapshot,
} from "../api/hooks";
import type { PcmKnowledgeDocument } from "../api/pcm";
import { NoProjectSelected, PageHeader, Surface } from "../components/ui";

const typeLabels: Record<string, string> = {
  domain_rule: "도메인 규칙",
  convention: "관례",
  term: "용어",
};

function typeLabel(type: string) {
  return typeLabels[type] ?? type;
}

function SnapshotSummary({ projectId }: { projectId: number }) {
  const snapshotQuery = usePcmSnapshot(projectId);
  const snapshot = snapshotQuery.data;
  const repositoryCount = snapshot
    ? Object.keys(snapshot.repository_revisions ?? {}).length
    : 0;

  const items = [
    {
      label: "PCM revision",
      value: snapshot?.pcm_revision ?? "—",
      pending: snapshotQuery.isPending,
    },
    {
      label: "지식 인덱스 revision",
      value: snapshot?.knowledge_index_revision ?? "—",
      pending: snapshotQuery.isPending,
    },
    {
      label: "연결 레포지토리",
      value: repositoryCount,
      pending: snapshotQuery.isPending,
    },
  ];

  return (
    <Surface className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4 text-sm font-bold text-slate-700">
        <ServerCog size={16} /> 스냅샷
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-xl font-extrabold text-slate-800">
              {item.pending ? (
                <LoaderCircle size={18} className="animate-spin text-slate-300" />
              ) : (
                item.value
              )}
            </p>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function KnowledgeRow({
  document,
  active,
  onSelect,
}: {
  document: PcmKnowledgeDocument;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-colors ${
        active
          ? "border-l-2 border-l-clio-600 bg-clio-50"
          : "border-l-2 border-l-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
          {document.title || document.logical_key}
        </p>
        {document.is_tombstone && (
          <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
            tombstone
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <code className="font-bold text-clio-600">{document.logical_key}</code>
        <span>{typeLabel(document.knowledge_type)}</span>
        <span>rev {document.knowledge_revision}</span>
        {document.sources.length > 0 && (
          <span>출처 {document.sources.length}</span>
        )}
      </div>
    </button>
  );
}

function KnowledgeDetailPanel({
  projectId,
  document,
}: {
  projectId: number;
  document: PcmKnowledgeDocument | null;
}) {
  const detailQuery = usePcmKnowledgeDetail(
    projectId,
    document?.knowledge_id ?? null,
  );
  const detail = detailQuery.data ?? document;

  if (!detail) {
    return (
      <Surface className="grid min-h-72 place-items-center overflow-hidden p-8 text-center">
        <div>
          <BookOpen className="mx-auto text-slate-300" size={30} />
          <p className="mt-4 text-sm font-bold text-slate-600">
            문서를 선택해 주세요
          </p>
          <p className="mt-1 text-xs text-slate-400">
            왼쪽 목록에서 PCM 지식 문서를 고르면 본문과 출처를 표시합니다.
          </p>
        </div>
      </Surface>
    );
  }

  return (
    <Surface className="flex min-h-72 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-clio-50 text-clio-600">
          <BrainCircuit size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-extrabold text-slate-800">
            {detail.title || detail.logical_key}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            <code>{detail.knowledge_id}</code> · {typeLabel(detail.knowledge_type)}
          </p>
        </div>
        {detailQuery.isFetching && (
          <LoaderCircle size={14} className="ml-auto shrink-0 animate-spin text-slate-300" />
        )}
      </div>
      <div className="flex-1 space-y-5 p-5">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            본문
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {detail.body_markdown || "본문이 없습니다."}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              유효 범위
            </p>
            <p className="mt-1 text-sm text-slate-700">
              from rev {detail.valid_from_pcm_revision ?? "—"}
              <br />
              until rev {detail.valid_until_pcm_revision ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              knowledge revision
            </p>
            <p className="mt-1 text-sm text-slate-700">{detail.knowledge_revision}</p>
          </div>
        </div>
        {detail.sources.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              <FileCode2 size={12} /> 출처
            </p>
            <ul className="mt-2 space-y-1.5">
              {detail.sources.map((source, index) => (
                <li
                  key={`${source.source_id}-${source.source_revision}-${index}`}
                  className="rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-600"
                >
                  <code className="font-bold text-clio-700">{source.source_id}</code>
                  <span className="mx-1.5 text-slate-300">·</span>
                  {source.source_type}
                  {source.source_revision && (
                    <>
                      <span className="mx-1.5 text-slate-300">·</span>rev{" "}
                      {source.source_revision}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {detail.related_knowledge_ids.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              <Link2 size={12} /> 관련 문서
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {detail.related_knowledge_ids.map((id) => (
                <code
                  key={id}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600"
                >
                  {id}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </Surface>
  );
}

export function PcmInspectPage({ projectId }: { projectId: number | null }) {
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(
    null,
  );
  const knowledgeQuery = usePcmKnowledge(projectId);

  if (projectId === null) {
    return (
      <div className="animate-page">
        <PageHeader
          eyebrow="DEVELOPER TOOLS"
          title="PCM 메모리"
          description="에이전트가 프로젝트에 대해 기억하는 컨텍스트 메모리를 조회합니다."
        />
        <NoProjectSelected />
      </div>
    );
  }

  const documents = knowledgeQuery.data ?? [];
  const selectedDocument =
    documents.find((document) => document.knowledge_id === selectedKnowledgeId) ??
    null;

  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="DEVELOPER TOOLS"
        title="PCM 메모리"
        description="에이전트가 프로젝트에 대해 기억하는 컨텍스트 메모리를 조회합니다."
      />
      <div className="grid gap-6 p-4 lg:p-8">
        <SnapshotSummary projectId={projectId} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 p-4 text-sm font-bold text-slate-700">
              <Braces size={16} /> 지식 문서 ({documents.length})
              {knowledgeQuery.isFetching && (
                <LoaderCircle
                  size={14}
                  className="ml-auto animate-spin text-slate-300"
                />
              )}
            </div>
            {knowledgeQuery.isPending ? (
              <div className="grid min-h-56 place-items-center text-slate-300">
                <LoaderCircle size={22} className="animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="grid min-h-56 place-items-center text-center">
                <div>
                  <SearchX className="mx-auto text-slate-300" size={26} />
                  <p className="mt-3 text-sm font-bold text-slate-600">
                    저장된 지식 문서가 없습니다
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    에이전트가 프로젝트를 분석한 뒤 문서가 채워집니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                {documents.map((document) => (
                  <KnowledgeRow
                    key={document.knowledge_id}
                    document={document}
                    active={document.knowledge_id === selectedKnowledgeId}
                    onSelect={() => setSelectedKnowledgeId(document.knowledge_id)}
                  />
                ))}
              </div>
            )}
          </Surface>
          <KnowledgeDetailPanel projectId={projectId} document={selectedDocument} />
        </div>
      </div>
    </div>
  );
}
