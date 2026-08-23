import { FolderKanban } from "lucide-react";
import { Button, PageHeader, Surface } from "../components/ui";

export function ProjectCreationPage({
  onCancel,
  onDirtyChange,
}: {
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="NEW PROJECT"
        title="새 프로젝트 만들기"
        description="프로젝트 정보와 분석에 필요한 자료를 단계별로 설정합니다."
      />
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <Surface className="p-8 text-center">
          <FolderKanban className="mx-auto text-clio-600" size={32} />
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">
            프로젝트 생성 준비
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            단계형 입력 화면을 준비하고 있습니다.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => {
              onDirtyChange(false);
              onCancel();
            }}
          >
            돌아가기
          </Button>
        </Surface>
      </div>
    </div>
  );
}
