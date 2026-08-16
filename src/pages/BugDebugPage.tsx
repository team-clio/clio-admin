import {
  AlertCircle,
  Braces,
  CheckCircle2,
  FlaskConical,
  LoaderCircle,
  RotateCcw,
  Send,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useCreateBug } from "../api/hooks";
import type { CreateBugRequest, CreatedBug } from "../api/bugs";
import { Button, Field, NoProjectSelected, PageHeader, Surface } from "../components/ui";

const sources = [
  "API",
  "SENTRY",
  "LOG",
  "MANUAL",
  "IN_APP_WIDGET",
  "CUSTOMER_SUPPORT",
  "EMAIL",
  "SLACK",
];
const inputClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

function localNow() {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return now.toISOString().slice(0, 16);
}

function initialForm() {
  return {
    source: "MANUAL",
    title: "",
    description: "",
    errorType: "",
    message: "",
    stackTrace: "",
    rawPayload: '{\n  "environment": "debug"\n}',
    occurredAt: localNow(),
  };
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function BugDebugPage({ projectId }: { projectId: number | null }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<CreatedBug | null>(null);
  const [error, setError] = useState("");
  const [rawError, setRawError] = useState("");

  const createBugMutation = useCreateBug(projectId);
  const submitting = createBugMutation.isPending;

  const parsedPayload = useMemo(() => {
    try {
      return form.rawPayload.trim() ? JSON.parse(form.rawPayload) : undefined;
    } catch {
      return undefined;
    }
  }, [form.rawPayload]);

  if (projectId === null) {
    return (
      <div className="animate-page">
        <PageHeader
          eyebrow="DEBUG TOOLS"
          title="버그 등록 테스트"
          description="선택한 프로젝트로 실제 버그 수집 API 요청을 전송합니다."
        />
        <NoProjectSelected />
      </div>
    );
  }

  const payload: CreateBugRequest = {
    source: form.source,
    title: optional(form.title),
    description: optional(form.description),
    error_type: optional(form.errorType),
    message: optional(form.message),
    stack_trace: form.stackTrace
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    raw_payload: parsedPayload,
    occurred_at: form.occurredAt ? new Date(form.occurredAt).toISOString() : "",
  };

  const update = (key: keyof ReturnType<typeof initialForm>, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setRawError("");
    if (projectId === null) {
      setError("사이드바에서 프로젝트를 먼저 선택해 주세요.");
      return;
    }
    if (!form.occurredAt) {
      setError("발생 시각을 입력해 주세요.");
      return;
    }
    if (form.rawPayload.trim() && parsedPayload === undefined) {
      setRawError("올바른 JSON 형식이 아닙니다.");
      return;
    }
    try {
      setResult(await createBugMutation.mutateAsync(payload));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "버그 등록에 실패했습니다.",
      );
    }
  };

  const fillSample = () =>
    setForm({
      source: "SENTRY",
      title: "결제 화면에서 TypeError 발생",
      description: "결제 완료 버튼을 누른 직후 화면이 멈춥니다.",
      errorType: "TypeError",
      message: "Cannot read properties of undefined (reading 'id')",
      stackTrace:
        "at submitPayment (src/pages/Checkout.tsx:84:21)\nat onClick (src/components/PayButton.tsx:31:9)",
      rawPayload:
        '{\n  "environment": "staging",\n  "browser": "Chrome",\n  "release": "2026.08.13"\n}',
      occurredAt: localNow(),
    });

  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="DEBUG TOOLS"
        title="버그 등록 테스트"
        description="선택한 프로젝트로 실제 버그 수집 API 요청을 전송합니다."
      />
      <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-8">
        <Surface as="form" onSubmit={submit} className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
              <FlaskConical size={18} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">
                요청 데이터
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                프로젝트 ID: {projectId ?? "선택되지 않음"}
              </p>
            </div>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field id="source" label="소스 *">
              <select
                id="source"
                className={inputClass}
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
              >
                {sources.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </Field>
            <Field
              id="occurredAt"
              label="발생 시각 *"
              help="전송 시 ISO 8601 UTC 형식으로 변환됩니다."
            >
              <input
                id="occurredAt"
                required
                type="datetime-local"
                className={inputClass}
                value={form.occurredAt}
                onChange={(e) => update("occurredAt", e.target.value)}
              />
            </Field>
            <Field id="title" label="제목" className="sm:col-span-2">
              <input
                id="title"
                maxLength={200}
                className={inputClass}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="버그를 한 문장으로 요약"
              />
            </Field>
            <Field id="errorType" label="오류 유형">
              <input
                id="errorType"
                maxLength={255}
                className={inputClass}
                value={form.errorType}
                onChange={(e) => update("errorType", e.target.value)}
                placeholder="TypeError"
              />
            </Field>
            <Field id="message" label="오류 메시지">
              <input
                id="message"
                className={inputClass}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Cannot read..."
              />
            </Field>
            <Field id="description" label="설명" className="sm:col-span-2">
              <textarea
                id="description"
                rows={3}
                className={inputClass}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="발생 상황과 재현 과정을 입력하세요."
              />
            </Field>
            <Field
              id="stackTrace"
              label="스택 트레이스"
              help="한 줄을 배열의 한 항목으로 전송합니다."
              className="sm:col-span-2"
            >
              <textarea
                id="stackTrace"
                rows={4}
                className={`${inputClass} font-mono text-xs`}
                value={form.stackTrace}
                onChange={(e) => update("stackTrace", e.target.value)}
                placeholder="at functionName (file.ts:10:2)"
              />
            </Field>
            <Field
              id="rawPayload"
              label="Raw payload (JSON)"
              className="sm:col-span-2"
            >
              <textarea
                id="rawPayload"
                rows={6}
                aria-invalid={Boolean(rawError)}
                className={`${inputClass} font-mono text-xs ${rawError ? "border-rose-400 ring-2 ring-rose-100" : ""}`}
                value={form.rawPayload}
                onChange={(e) => {
                  update("rawPayload", e.target.value);
                  setRawError("");
                }}
              />
              {rawError && (
                <p
                  role="alert"
                  className="mt-2 text-xs font-bold text-rose-600"
                >
                  {rawError}
                </p>
              )}
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <Button type="button" variant="secondary" onClick={fillSample}>
              샘플 채우기
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setForm(initialForm());
                  setError("");
                  setResult(null);
                }}
              >
                <RotateCcw size={14} /> 초기화
              </Button>
              <Button type="submit" disabled={submitting || projectId === null}>
                {submitting ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {submitting ? "전송 중" : "실제 API 전송"}
              </Button>
            </div>
          </div>
        </Surface>
        <div className="space-y-6">
          {error && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <AlertCircle className="shrink-0" size={18} />
              <div>
                <p className="font-bold">등록 실패</p>
                <p className="mt-1 text-xs leading-5">{error}</p>
              </div>
            </div>
          )}
          {result && (
            <div className="animate-pop rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                <CheckCircle2 size={18} /> 등록 성공 · BUG-{result.id}
              </p>
              <p className="mt-2 text-xs text-emerald-700">
                상태 {result.status} · 프로젝트 {result.project_id}
              </p>
            </div>
          )}
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 p-4 text-sm font-bold text-slate-700">
              <Braces size={16} /> 전송 JSON 미리보기
            </div>
            <pre className="max-h-[520px] overflow-auto bg-slate-950 p-4 text-xs leading-5 text-slate-300">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </Surface>
          {result && (
            <Surface className="overflow-hidden">
              <div className="border-b border-slate-100 p-4 text-sm font-bold text-slate-700">
                서버 응답
              </div>
              <pre className="max-h-80 overflow-auto bg-slate-950 p-4 text-xs leading-5 text-emerald-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </Surface>
          )}
        </div>
      </div>
    </div>
  );
}
