import { Download, RefreshCcw, Trash2 } from "lucide-react";
import { buildOutputFilename } from "./queue";
import { ImagePanel } from "./ImagePanel";
import type { RoomImage } from "./types";

type Props = {
  item: RoomImage;
  onRemove: (id: string) => void;
  onRequeue: (id: string) => void;
};

export function RoomImageCard({ item, onRemove, onRequeue }: Props) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#d5d2c5] bg-white shadow-sm">
      <div className="grid gap-px bg-[#d5d2c5] sm:grid-cols-2">
        <ImagePanel label="Before" src={item.previewUrl} />
        <ImagePanel label="After" src={item.outputUrl} status={item.status} />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.file.name}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-[#626158]">{item.status}</p>
          {item.error ? <p className="mt-1 text-sm text-[#8f351c]">{item.error}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {item.outputUrl ? (
            <a
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c8c6bb] text-[#24505c]"
              href={item.outputUrl}
              download={buildOutputFilename(item.file.name)}
              title="Download output"
            >
              <Download aria-hidden="true" size={18} />
            </a>
          ) : null}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c8c6bb] text-[#393832]"
            type="button"
            onClick={() => onRequeue(item.id)}
            title="Queue again"
          >
            <RefreshCcw aria-hidden="true" size={17} />
          </button>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c8c6bb] text-[#8f351c]"
            type="button"
            onClick={() => onRemove(item.id)}
            title="Remove image"
          >
            <Trash2 aria-hidden="true" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
