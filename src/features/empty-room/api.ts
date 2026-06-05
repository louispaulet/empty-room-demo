import { DEFAULT_WORKER_URL } from "./constants";
import type { EmptyRoomResult, GenerationSettingsValues } from "./types";

export const WORKER_URL = (import.meta.env.VITE_WORKER_URL || DEFAULT_WORKER_URL).replace(/\/$/, "");

export async function requestEmptyRoomEdit(
  file: File,
  settings: GenerationSettingsValues,
  workerUrl = WORKER_URL,
): Promise<EmptyRoomResult> {
  const body = new FormData();
  body.append("image", file);
  body.append("prompt", settings.prompt);
  body.append("model", settings.model);
  body.append("quality", settings.quality);
  body.append("size", settings.size);

  const response = await fetch(`${workerUrl}/api/empty-room`, {
    method: "POST",
    body,
  });
  const result = (await response.json()) as EmptyRoomResult & { error?: string };

  if (!response.ok || !result.image) {
    throw new Error(result.error ?? "The room could not be processed.");
  }

  return result;
}
