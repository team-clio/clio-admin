import { UploadPanel } from "./DocumentsPage";

export default {
  title: "Pages/Documents",
  parameters: { layout: "fullscreen" },
};

export const UploadDropzone = {
  render: () => (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <UploadPanel onUpload={async () => undefined} />
      </div>
    </div>
  ),
};
