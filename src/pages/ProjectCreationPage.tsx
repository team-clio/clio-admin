import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileText, FolderGit2, FolderKanban, LoaderCircle, RotateCcw, UploadCloud, X } from "lucide-react";
import { createProjectDocument, createProjectRepository, type CreateProjectInput, type Project, type RepositoryInput, type RepositoryProvider } from "../api/projects";
import { Button, Field, IconButton, PageHeader, Surface } from "../components/ui";

type UploadStatus = "READY" | "UPLOADING" | "SUCCEEDED" | "FAILED";
type RequestStatus = "IDLE" | "RUNNING" | "SUCCEEDED" | "FAILED";
interface QueuedDocument { id: string; file: File; title: string; status: UploadStatus; error?: string }

const steps = [
  { title: "기본 정보", description: "이름과 목적" },
  { title: "저장소", description: "코드 분석 범위" },
  { title: "참고 문서", description: "분석 맥락" },
  { title: "검토·생성", description: "설정 확인" },
];
const emptyRepository: RepositoryInput = { provider: "GITHUB", owner: "", name: "", url: "", defaultBranch: "main", includePaths: [], excludePaths: [], enabled: true };
const inputClass = "mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";
const splitPaths = (value: string) => value.split(",").map((path) => path.trim()).filter(Boolean);
const titleFromFilename = (filename: string) => filename.replace(/\.(pdf|md|markdown)$/i, "");
const isAcceptedFile = (file: File) => /\.(pdf|md|markdown)$/i.test(file.name);

function StepIndicator({ current }: { current: number }) {
  return <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="프로젝트 생성 단계">{steps.map((item, index) => <li key={item.title} aria-current={current === index ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors sm:px-4 ${current === index ? "border-clio-300 bg-clio-50" : index < current ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white"}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ${current === index ? "bg-clio-600 text-white" : index < current ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>{index < current ? <Check size={15} /> : index + 1}</span><span className="min-w-0"><strong className="block truncate text-xs text-slate-800">{item.title}</strong><span className="mt-0.5 hidden truncate text-[11px] text-slate-400 sm:block">{item.description}</span></span></li>)}</ol>;
}

function BasicInfoStep({ name, description, onNameChange, onDescriptionChange }: { name: string; description: string; onNameChange: (value: string) => void; onDescriptionChange: (value: string) => void }) {
  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]"><div className="space-y-6"><Field id="wizard-name" label="프로젝트 이름" help="사이드바와 프로젝트 목록에 표시됩니다."><input id="wizard-name" autoFocus maxLength={120} value={name} onChange={(event) => onNameChange(event.target.value)} className={inputClass} placeholder="예: Clio Mobile" /></Field><Field id="wizard-description" label="설명 (선택)" help="제품이나 서비스의 범위와 주요 목적을 적어 주세요."><textarea id="wizard-description" rows={6} maxLength={1000} value={description} onChange={(event) => onDescriptionChange(event.target.value)} className={`${inputClass} resize-none`} placeholder="어떤 서비스에서 발생하는 버그를 수집하고 분석할지 설명해 주세요." /></Field></div><aside className="rounded-xl bg-slate-50 p-5"><FolderKanban className="text-clio-600" size={24} /><h3 className="mt-4 text-sm font-extrabold text-slate-800">프로젝트가 작업의 기준입니다</h3><p className="mt-2 text-xs leading-5 text-slate-500">버그, 이슈, 코드 저장소와 참고 문서는 프로젝트별로 분리됩니다. 이름은 나중에 설정에서 바꿀 수 있습니다.</p></aside></div>;
}

function RepositoryStep({ enabled, repository, onEnabledChange, onChange }: { enabled: boolean; repository: RepositoryInput; onEnabledChange: (value: boolean) => void; onChange: (value: RepositoryInput) => void }) {
  const set = <K extends keyof RepositoryInput>(key: K, value: RepositoryInput[K]) => onChange({ ...repository, [key]: value });
  return <div><label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition-colors ${enabled ? "border-clio-300 bg-clio-50/60" : "border-slate-200 bg-slate-50"}`}><input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} className="mt-1 size-4 accent-blue-600" /><span><strong className="block text-sm text-slate-800">코드 저장소 연결</strong><span className="mt-1 block text-xs leading-5 text-slate-500">코드 근거와 수정 위치를 찾을 수 있도록 저장소 하나를 연결합니다. 나중에 설정할 수도 있습니다.</span></span></label>{enabled && <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id="wizard-provider" label="Provider"><select id="wizard-provider" value={repository.provider} onChange={(event) => set("provider", event.target.value as RepositoryProvider)} className={inputClass}><option value="GITHUB">GitHub</option><option value="GITLAB">GitLab</option><option value="BITBUCKET">Bitbucket</option></select></Field><Field id="wizard-branch" label="기본 브랜치"><input id="wizard-branch" value={repository.defaultBranch} onChange={(event) => set("defaultBranch", event.target.value)} className={inputClass} placeholder="main" /></Field><Field id="wizard-owner" label="소유자"><input id="wizard-owner" value={repository.owner} onChange={(event) => set("owner", event.target.value)} className={inputClass} placeholder="openai" /></Field><Field id="wizard-repo-name" label="저장소 이름"><input id="wizard-repo-name" value={repository.name} onChange={(event) => set("name", event.target.value)} className={inputClass} placeholder="clio" /></Field><Field id="wizard-repo-url" label="저장소 URL" className="sm:col-span-2"><input id="wizard-repo-url" type="url" value={repository.url} onChange={(event) => set("url", event.target.value)} className={inputClass} placeholder="https://github.com/openai/clio" /></Field><Field id="wizard-include" label="분석 경로 (선택)" help="쉼표로 여러 경로를 구분합니다." className="sm:col-span-2"><input id="wizard-include" value={repository.includePaths.join(", ")} onChange={(event) => set("includePaths", splitPaths(event.target.value))} className={inputClass} placeholder="src, packages/api" /></Field><Field id="wizard-exclude" label="제외 경로 (선택)" help="빌드 결과물이나 외부 의존성을 제외할 수 있습니다." className="sm:col-span-2"><input id="wizard-exclude" value={repository.excludePaths.join(", ")} onChange={(event) => set("excludePaths", splitPaths(event.target.value))} className={inputClass} placeholder="dist, node_modules" /></Field></div>}</div>;
}

function DocumentsStep({ documents, onAdd, onChangeTitle, onRemove }: { documents: QueuedDocument[]; onAdd: (files: File[]) => void; onChangeTitle: (id: string, title: string) => void; onRemove: (id: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return <div><div className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${dragging ? "border-clio-500 bg-clio-50" : "border-slate-200 bg-slate-50/70"}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); onAdd(Array.from(event.dataTransfer.files)); }}><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-clio-600 shadow-sm ring-1 ring-slate-200"><UploadCloud size={23} /></span><h3 className="mt-4 text-sm font-extrabold text-slate-800">분석에 참고할 문서를 추가하세요</h3><p className="mt-1.5 text-xs leading-5 text-slate-400">PDF 또는 Markdown 파일을 여러 개 선택할 수 있습니다. 이 단계는 건너뛸 수 있습니다.</p><Button type="button" variant="secondary" className="mt-4" onClick={() => inputRef.current?.click()}>파일 선택</Button><input ref={inputRef} type="file" multiple accept=".pdf,.md,.markdown,application/pdf,text/markdown" className="sr-only" aria-label="프로젝트 참고 문서 선택" onChange={(event) => { onAdd(Array.from(event.target.files ?? [])); event.target.value = ""; }} /></div>{documents.length > 0 && <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">{documents.map((document) => <div key={document.id} className="flex items-start gap-3 p-4"><FileText className="mt-2 shrink-0 text-slate-400" size={17} /><div className="min-w-0 flex-1"><input value={document.title} maxLength={200} onChange={(event) => onChangeTitle(document.id, event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-clio-500 focus:ring-2 focus:ring-blue-100" aria-label={`${document.file.name} 문서 제목`} /><p className="mt-1 truncate text-[11px] text-slate-400">{document.file.name}</p></div><IconButton type="button" onClick={() => onRemove(document.id)} aria-label={`${document.file.name} 제거`}><X size={15} /></IconButton></div>)}</div>}</div>;
}

function StatusBadge({ status }: { status: RequestStatus | UploadStatus }) {
  const labels = { IDLE: "대기", READY: "대기", RUNNING: "진행 중", UPLOADING: "업로드 중", SUCCEEDED: "완료", FAILED: "실패" };
  const style = status === "SUCCEEDED" ? "bg-emerald-50 text-emerald-700" : status === "FAILED" ? "bg-rose-50 text-rose-700" : status === "RUNNING" || status === "UPLOADING" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style}`}>{labels[status]}</span>;
}

function SummaryCard({ icon, title, value, detail, status }: { icon: React.ReactNode; title: string; value: string; detail: string; status?: RequestStatus }) {
  return <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between text-slate-400"><span>{icon}</span>{status && <StatusBadge status={status} />}</div><p className="mt-4 text-xs font-bold text-slate-400">{title}</p><p className="mt-1 truncate text-sm font-extrabold text-slate-800">{value}</p><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">{detail}</p></div>;
}

export function ProjectCreationPage({ onCancel, onDirtyChange, onCreateProject, onProjectCreated, onFinish, onOpenSettings }: { onCancel: () => void; onDirtyChange: (dirty: boolean) => void; onCreateProject: (input: CreateProjectInput) => Promise<Project>; onProjectCreated: (project: Project) => void; onFinish: () => void; onOpenSettings: () => void }) {
  const sequenceRef = useRef(0);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryEnabled, setRepositoryEnabled] = useState(false);
  const [repository, setRepository] = useState<RepositoryInput>(emptyRepository);
  const [documents, setDocuments] = useState<QueuedDocument[]>([]);
  const [validationError, setValidationError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [repositoryError, setRepositoryError] = useState("");
  const [repositoryStatus, setRepositoryStatus] = useState<RequestStatus>("IDLE");
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dirty = !createdProject && (name.trim() !== "" || description.trim() !== "" || repositoryEnabled || documents.length > 0);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const validateStep = () => {
    if (step === 0 && !name.trim()) return "프로젝트 이름을 입력해 주세요.";
    if (step === 1 && repositoryEnabled) {
      if (!repository.owner.trim() || !repository.name.trim() || !repository.url.trim()) return "저장소 소유자, 이름과 URL을 모두 입력해 주세요.";
      try { const url = new URL(repository.url); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); } catch { return "http 또는 https 형식의 올바른 저장소 URL을 입력해 주세요."; }
    }
    if (step === 2 && documents.some((item) => !item.title.trim())) return "모든 참고 문서의 제목을 입력해 주세요.";
    return "";
  };
  const next = () => { const error = validateStep(); setValidationError(error); if (!error) setStep((current) => Math.min(current + 1, 3)); };
  const addFiles = (files: File[]) => { const accepted = files.filter(isAcceptedFile); setValidationError(accepted.length !== files.length ? "PDF 또는 Markdown이 아닌 파일은 제외했습니다." : ""); setDocuments((current) => [...current, ...accepted.map((file) => ({ id: `${file.name}-${file.lastModified}-${sequenceRef.current++}`, file, title: titleFromFilename(file.name), status: "READY" as const }))]); };

  const submit = async () => {
    setSubmitting(true); setProjectError(""); setRepositoryError("");
    let project = createdProject;
    try { if (!project) { project = await onCreateProject({ name: name.trim(), description: description.trim() || undefined }); setCreatedProject(project); onProjectCreated(project); onDirtyChange(false); } }
    catch (reason) { setProjectError(reason instanceof Error ? reason.message : "프로젝트를 만들지 못했습니다."); setSubmitting(false); return; }
    let failed = false;
    if (repositoryEnabled && repositoryStatus !== "SUCCEEDED") {
      setRepositoryStatus("RUNNING");
      try { await createProjectRepository(project.id, { ...repository, owner: repository.owner.trim(), name: repository.name.trim(), url: repository.url.trim(), defaultBranch: repository.defaultBranch.trim() || "main" }); setRepositoryStatus("SUCCEEDED"); }
      catch (reason) { failed = true; setRepositoryStatus("FAILED"); setRepositoryError(reason instanceof Error ? reason.message : "저장소를 연결하지 못했습니다."); }
    }
    for (const document of documents.filter((item) => item.status !== "SUCCEEDED")) {
      setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, status: "UPLOADING", error: undefined } : item));
      try { await createProjectDocument(project.id, document.title.trim(), document.file); setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, status: "SUCCEEDED" } : item)); }
      catch (reason) { failed = true; setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, status: "FAILED", error: reason instanceof Error ? reason.message : "업로드하지 못했습니다." } : item)); }
    }
    setSubmitting(false);
    if (!failed) onFinish();
  };
  const hasFailed = repositoryStatus === "FAILED" || documents.some((item) => item.status === "FAILED");

  return <div className="animate-page"><PageHeader eyebrow="NEW PROJECT" title="새 프로젝트 만들기" description="프로젝트 정보와 분석에 필요한 자료를 단계별로 설정합니다." /><div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8"><StepIndicator current={step} /><Surface className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-5 sm:px-7"><p className="text-xs font-bold text-clio-600">STEP {step + 1} OF 4</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{steps[step].title}</h2></div><div className="min-h-[25rem] p-5 sm:p-7">{step === 0 && <BasicInfoStep name={name} description={description} onNameChange={setName} onDescriptionChange={setDescription} />}{step === 1 && <RepositoryStep enabled={repositoryEnabled} repository={repository} onEnabledChange={setRepositoryEnabled} onChange={setRepository} />}{step === 2 && <DocumentsStep documents={documents} onAdd={addFiles} onChangeTitle={(id, title) => setDocuments((current) => current.map((item) => item.id === id ? { ...item, title } : item))} onRemove={(id) => setDocuments((current) => current.filter((item) => item.id !== id))} />}{step === 3 && <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><SummaryCard icon={<FolderKanban size={19} />} title="기본 정보" value={name.trim()} detail={description.trim() || "설명 없음"} /><SummaryCard icon={<FolderGit2 size={19} />} title="저장소" value={repositoryEnabled ? `${repository.owner}/${repository.name}` : "건너뜀"} detail={repositoryEnabled ? repository.defaultBranch || "main" : "설정에서 나중에 연결 가능"} status={repositoryEnabled && createdProject ? repositoryStatus : undefined} /><SummaryCard icon={<FileText size={19} />} title="참고 문서" value={documents.length ? `${documents.length}개` : "건너뜀"} detail={documents.length ? documents.map((item) => item.file.name).join(", ") : "설정에서 나중에 업로드 가능"} /></div>{createdProject && <div className={`rounded-xl border p-5 ${hasFailed ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><div className="flex items-start gap-3"><CheckCircle2 className={hasFailed ? "text-amber-600" : "text-emerald-600"} size={22} /><div><h3 className="text-sm font-extrabold text-slate-800">{hasFailed ? "프로젝트는 생성되었지만 일부 설정에 실패했습니다" : "프로젝트를 생성했습니다"}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{hasFailed ? "실패 항목을 다시 시도하거나 프로젝트 설정에서 이어서 작업할 수 있습니다." : "선택한 설정을 적용하고 있습니다."}</p></div></div></div>}{repositoryError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-700">저장소: {repositoryError}</p>}{documents.filter((item) => item.status !== "READY").map((document) => <div key={document.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3"><FileText size={15} className="text-slate-400" /><span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">{document.file.name}{document.error ? ` · ${document.error}` : ""}</span><StatusBadge status={document.status} /></div>)}{projectError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-700">{projectError}</p>}</div>}{validationError && <p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">{validationError}</p>}</div><div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><Button type="button" variant="ghost" disabled={submitting} onClick={onCancel}>취소</Button><div className="flex gap-2">{step > 0 && !createdProject && <Button type="button" variant="secondary" onClick={() => { setValidationError(""); setStep((current) => current - 1); }}><ArrowLeft size={14} />이전</Button>}{step < 3 ? <Button type="button" onClick={next}>다음<ArrowRight size={14} /></Button> : hasFailed ? <><Button type="button" variant="secondary" onClick={onOpenSettings}>프로젝트 설정</Button><Button type="button" disabled={submitting} onClick={submit}>{submitting ? <LoaderCircle size={14} className="animate-spin" /> : <RotateCcw size={14} />}{submitting ? "재시도 중" : "실패 항목 재시도"}</Button></> : <Button type="button" disabled={submitting} onClick={submit}>{submitting && <LoaderCircle size={14} className="animate-spin" />}{submitting ? "프로젝트 만드는 중" : "프로젝트 만들기"}</Button>}</div></div></Surface></div></div>;
}
