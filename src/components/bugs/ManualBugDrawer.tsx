import { AlertCircle, LoaderCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCreateBug } from "../../api/hooks";
import type { CreatedBug } from "../../api/bugs";
import { Button, Field, IconButton } from "../ui";

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-clio-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

function localNow() {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return now.toISOString().slice(0, 16);
}

/** 스택 트레이스 없이 사람이 직접 남기는 제보(기능 오류·필요한 응답 등)를 MANUAL 소스로 등록한다 */
export function ManualBugDrawer({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: number;
  onClose: () => void;
  onCreated: (bug: CreatedBug) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(localNow);
  const createBugMutation = useCreateBug(projectId);
  const submitting = createBugMutation.isPending;
  const error =
    createBugMutation.error instanceof Error
      ? createBugMutation.error.message
      : "";

  const dirty = title.trim() !== "" || description.trim() !== "";

  const close = () => {
    if (submitting) return;
    if (dirty && !window.confirm("작성 중인 제보가 사라집니다. 닫을까요?")) {
      return;
    }
    onClose();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    // required는 공백만 입력한 값을 걸러내지 못하므로 한 번 더 확인한다.
    if (!title.trim() || !description.trim()) return;
    createBugMutation.mutate(
      {
        source: "MANUAL",
        title: title.trim(),
        description: description.trim(),
        stack_trace: [],
        occurred_at: new Date(occurredAt || localNow()).toISOString(),
      },
      { onSuccess: onCreated },
    );
  };

  return (
    <div className="animate-overlay fixed inset-x-0 bottom-0 top-14 z-[70]">
      <button
        className="absolute inset-0 bg-slate-950/30"
        aria-label="닫기"
        onClick={close}
      />
      <form
        onSubmit={submit}
        aria-labelledby="manual-bug-title"
        className="animate-drawer absolute bottom-0 right-0 top-0 flex w-full max-w-lg flex-col bg-white shadow-2xl"
      >
        <div className="flex justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold text-clio-600">수동 등록</p>
            <h2
              id="manual-bug-title"
              className="mt-2 text-xl font-extrabold text-slate-900"
            >
              버그 제보
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              안 되는 기능이나 더 필요한 응답을 적어 주세요. 버그인지 확실하지
              않아도 등록할 수 있습니다.
            </p>
          </div>
          <IconButton type="button" onClick={close} aria-label="닫기">
            ×
          </IconButton>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <Field id="manual-title" label="제목 *">
            <input
              id="manual-title"
              required
              autoFocus
              maxLength={200}
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 주문 목록에서 취소된 주문이 보이지 않음"
            />
          </Field>
          <Field
            id="manual-description"
            label="내용 *"
            help="어떤 화면·API에서, 무엇을 했을 때, 무엇을 기대했는지 적으면 분석 정확도가 올라갑니다."
          >
            <textarea
              id="manual-description"
              required
              rows={8}
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                "예) 주문 조회 API 응답에 배송 상태 필드가 없어 화면에 표시할 수 없습니다.\n기대: status 외에 delivery_status도 함께 내려와야 함"
              }
            />
          </Field>
          <Field
            id="manual-occurred-at"
            label="발생 시각"
            help="정확히 모르면 그대로 두세요. 지금 시각으로 등록됩니다."
          >
            <input
              id="manual-occurred-at"
              type="datetime-local"
              className={inputClass}
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
            />
          </Field>
        </div>
        {error && (
          <div
            role="alert"
            className="flex gap-3 border-t border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700"
          >
            <AlertCircle className="shrink-0" size={18} />
            <div>
              <p className="font-bold">등록하지 못했습니다</p>
              <p className="mt-1 text-xs leading-5">{error}</p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <Button type="button" variant="ghost" onClick={close}>
            취소
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting ? "등록 중" : "등록"}
          </Button>
        </div>
      </form>
    </div>
  );
}
