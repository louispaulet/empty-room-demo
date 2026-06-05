import { UploadCloud } from "lucide-react";
import type { ChangeEvent, DragEvent } from "react";
import { ACCEPTED_IMAGE_TYPES } from "../../lib/files";

type Props = {
  notice: string | null;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ImageDropzone({ notice, onDrop, onFileInput }: Props) {
  return (
    <>
      <label
        className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#9f9c8f] bg-white p-6 text-center shadow-sm transition hover:border-[#496d76] hover:bg-[#fdfdfb]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input className="sr-only" type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={onFileInput} />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dde8ea] text-[#24505c]">
          <UploadCloud aria-hidden="true" size={24} />
        </span>
        <span className="text-lg font-semibold">Add room photos</span>
        <span className="max-w-xs text-sm leading-6 text-[#626158]">
          Drop files here or choose JPG, PNG, or WebP images up to 50 MB.
        </span>
      </label>

      {notice ? (
        <div className="rounded-lg border border-[#d9b3a6] bg-[#fff7f3] px-4 py-3 text-sm text-[#7a3f2a]">
          {notice}
        </div>
      ) : null}
    </>
  );
}
