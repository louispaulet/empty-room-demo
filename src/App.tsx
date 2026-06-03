import {
  Download,
  ImagePlus,
  Loader2,
  RefreshCcw,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { ACCEPTED_IMAGE_TYPES, validateRoomImage } from "./lib/files";

const DEFAULT_PROMPT =
  "Please remove the furniture and most of the objects so that only the walls, floors, and windows remain in this picture.";

const DEFAULT_WORKER_URL = "http://127.0.0.1:8787";
const WORKER_URL = (import.meta.env.VITE_WORKER_URL || DEFAULT_WORKER_URL).replace(/\/$/, "");

type ImageStatus = "queued" | "processing" | "done" | "error";

type RoomImage = {
  id: string;
  file: File;
  previewUrl: string;
  status: ImageStatus;
  outputUrl?: string;
  error?: string;
};

type Settings = {
  model: string;
  quality: string;
  size: string;
  prompt: string;
};

const defaultSettings: Settings = {
  model: "gpt-image-2",
  quality: "high",
  size: "1024x1024",
  prompt: DEFAULT_PROMPT,
};

function App() {
  const [items, setItems] = useState<RoomImage[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "queued" || item.status === "processing").length,
    [items],
  );

  function addFiles(files: FileList | File[]) {
    const nextItems: RoomImage[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateRoomImage(file);
      if (!validation.ok) {
        errors.push(validation.message ?? `${file.name} could not be added.`);
        return;
      }

      nextItems.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "queued",
      });
    });

    if (nextItems.length > 0) {
      setItems((current) => [...current, ...nextItems]);
    }
    setNotice(errors.length > 0 ? errors.join(" ") : null);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  function removeItem(id: string) {
    setItems((current) => {
      const item = current.find((candidate) => candidate.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return current.filter((candidate) => candidate.id !== id);
    });
  }

  function resetQueue() {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setNotice(null);
  }

  async function processItem(item: RoomImage) {
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === item.id ? { ...candidate, status: "processing", error: undefined } : candidate,
      ),
    );

    const body = new FormData();
    body.append("image", item.file);
    body.append("prompt", settings.prompt);
    body.append("model", settings.model);
    body.append("quality", settings.quality);
    body.append("size", settings.size);

    try {
      const response = await fetch(`${WORKER_URL}/api/empty-room`, {
        method: "POST",
        body,
      });
      const result = (await response.json()) as { image?: string; error?: string };

      if (!response.ok || !result.image) {
        throw new Error(result.error ?? "The room could not be processed.");
      }

      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, status: "done", outputUrl: result.image } : candidate,
        ),
      );
    } catch (error) {
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id
            ? {
                ...candidate,
                status: "error",
                error: error instanceof Error ? error.message : "The room could not be processed.",
              }
            : candidate,
        ),
      );
    }
  }

  async function processQueue(event?: FormEvent) {
    event?.preventDefault();
    const queuedItems = items.filter((item) => item.status === "queued" || item.status === "error");
    if (queuedItems.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    for (const item of queuedItems) {
      await processItem(item);
    }
    setIsProcessing(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-[#20201d]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#d9d7cd] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7a3f2a]">Empty Room Studio</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#1d1d1b] sm:text-4xl">
              Clear room photos down to walls, floors, and windows.
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#626158]">
            <span className="h-2 w-2 rounded-full bg-[#2e8b57]" />
            <span>{WORKER_URL}</span>
          </div>
        </header>

        <form className="grid flex-1 gap-5 lg:grid-cols-[360px_1fr]" onSubmit={processQueue}>
          <aside className="flex flex-col gap-4">
            <label
              className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#9f9c8f] bg-white p-6 text-center shadow-sm transition hover:border-[#496d76] hover:bg-[#fdfdfb]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                className="sr-only"
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleFileInput}
              />
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

            <section className="rounded-lg border border-[#d9d7cd] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal aria-hidden="true" size={18} />
                <h2 className="text-base font-semibold">Generation settings</h2>
              </div>
              <div className="grid gap-3">
                <label className="grid gap-1 text-sm font-medium">
                  Model
                  <select
                    className="rounded-md border border-[#c8c6bb] bg-white px-3 py-2"
                    value={settings.model}
                    onChange={(event) => setSettings({ ...settings, model: event.target.value })}
                  >
                    <option value="gpt-image-2">gpt-image-2</option>
                    <option value="gpt-image-1.5">gpt-image-1.5</option>
                    <option value="gpt-image-1">gpt-image-1</option>
                    <option value="gpt-image-1-mini">gpt-image-1-mini</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Quality
                  <select
                    className="rounded-md border border-[#c8c6bb] bg-white px-3 py-2"
                    value={settings.quality}
                    onChange={(event) => setSettings({ ...settings, quality: event.target.value })}
                  >
                    <option value="auto">Auto</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Size
                  <select
                    className="rounded-md border border-[#c8c6bb] bg-white px-3 py-2"
                    value={settings.size}
                    onChange={(event) => setSettings({ ...settings, size: event.target.value })}
                  >
                    <option value="1024x1024">1024 x 1024</option>
                    <option value="1536x1024">1536 x 1024</option>
                    <option value="1024x1536">1024 x 1536</option>
                    <option value="auto">Auto</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Prompt
                  <textarea
                    className="min-h-32 resize-y rounded-md border border-[#c8c6bb] bg-white px-3 py-2 leading-6"
                    value={settings.prompt}
                    onChange={(event) => setSettings({ ...settings, prompt: event.target.value })}
                  />
                </label>
              </div>
            </section>

            <div className="flex gap-2">
              <button
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#24505c] px-4 py-2 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-[#9aa8ab]"
                type="submit"
                disabled={isProcessing || items.length === 0 || pendingCount === 0}
              >
                {isProcessing ? <Loader2 aria-hidden="true" className="animate-spin" size={18} /> : <ImagePlus size={18} />}
                Generate
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#c8c6bb] bg-white px-3 text-[#393832] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={resetQueue}
                disabled={items.length === 0 || isProcessing}
                title="Clear queue"
              >
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          </aside>

          <section className="min-h-[520px] rounded-lg border border-[#d9d7cd] bg-[#ededdf] p-3 sm:p-4">
            {items.length === 0 ? (
              <div className="flex h-full min-h-[480px] items-center justify-center rounded-md border border-dashed border-[#bbb7a8] bg-[#f7f7f3] p-8 text-center text-[#626158]">
                <p className="max-w-sm text-base leading-7">Upload a furnished room photo to start the before and after queue.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {items.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-lg border border-[#d5d2c5] bg-white shadow-sm">
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
                            download={`empty-${item.file.name.replace(/\.[^.]+$/, "")}.png`}
                            title="Download output"
                          >
                            <Download aria-hidden="true" size={18} />
                          </a>
                        ) : null}
                        <button
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c8c6bb] text-[#393832]"
                          type="button"
                          onClick={() =>
                            setItems((current) =>
                              current.map((candidate) =>
                                candidate.id === item.id
                                  ? { ...candidate, status: "queued", error: undefined, outputUrl: undefined }
                                  : candidate,
                              ),
                            )
                          }
                          title="Queue again"
                        >
                          <RefreshCcw aria-hidden="true" size={17} />
                        </button>
                        <button
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c8c6bb] text-[#8f351c]"
                          type="button"
                          onClick={() => removeItem(item.id)}
                          title="Remove image"
                        >
                          <Trash2 aria-hidden="true" size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </form>
      </section>
    </main>
  );
}

function ImagePanel({ label, src, status }: { label: string; src?: string; status?: ImageStatus }) {
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

export default App;
