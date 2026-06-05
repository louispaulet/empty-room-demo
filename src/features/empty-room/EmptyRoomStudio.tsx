import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { validateRoomImage } from "../../lib/files";
import { requestEmptyRoomEdit } from "./api";
import { DEFAULT_SETTINGS } from "./constants";
import { GenerationSettings } from "./GenerationSettings";
import { ImageDropzone } from "./ImageDropzone";
import { getPendingCount, getProcessableItems } from "./queue";
import { QueueGallery } from "./QueueGallery";
import type { GenerationSettingsValues, RoomImage } from "./types";

export function EmptyRoomStudio() {
  const [items, setItems] = useState<RoomImage[]>([]);
  const [settings, setSettings] = useState<GenerationSettingsValues>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const pendingCount = useMemo(() => getPendingCount(items), [items]);

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

  function requeueItem(id: string) {
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, status: "queued", error: undefined, outputUrl: undefined } : candidate,
      ),
    );
  }

  async function processItem(item: RoomImage) {
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === item.id ? { ...candidate, status: "processing", error: undefined } : candidate,
      ),
    );

    try {
      const result = await requestEmptyRoomEdit(item.file, settings);

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
    const queuedItems = getProcessableItems(items);
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
    <form className="grid gap-5 lg:grid-cols-[360px_1fr]" onSubmit={processQueue}>
      <aside className="flex flex-col gap-4">
        <ImageDropzone notice={notice} onDrop={handleDrop} onFileInput={handleFileInput} />
        <GenerationSettings settings={settings} onChange={setSettings} />

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

      <QueueGallery items={items} onRemoveItem={removeItem} onRequeueItem={requeueItem} />
    </form>
  );
}
