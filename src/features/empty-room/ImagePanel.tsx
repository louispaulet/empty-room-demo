import { Loader2 } from "lucide-react";
import type { ImageStatus } from "./types";

type Props = {
  label: string;
  src?: string;
  status?: ImageStatus;
};

export function ImagePanel({ label, src, status }: Props) {
  return (
    <div className="relative flex aspect-[4/3] min-h-56 items-center justify-center bg-[#e8e6d8]">
      <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
        {label}
      </span>
      {src ? (
        <img alt={`${label} room`} className="h-full w-full object-cover" src={src} />
      ) : status === "processing" ? (
        <div className="flex flex-col items-center gap-3 text-[#24505c]">
          <Loader2 aria-hidden="true" className="animate-spin" size={28} />
          <span className="text-sm font-medium">Processing</span>
        </div>
      ) : (
        <span className="px-6 text-center text-sm leading-6 text-[#626158]">The cleared room will appear here.</span>
      )}
    </div>
  );
}
