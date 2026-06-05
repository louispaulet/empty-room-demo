import type { GenerationSettingsValues, SelectOption } from "./types";

export const DEFAULT_PROMPT =
  "Please remove the furniture and most of the objects so that only the walls, floors, and windows remain in this picture.";

export const DEFAULT_WORKER_URL = "http://127.0.0.1:8787";

export const DEFAULT_SETTINGS: GenerationSettingsValues = {
  model: "gpt-image-2",
  quality: "high",
  size: "1024x1024",
  prompt: DEFAULT_PROMPT,
};

export const MODEL_OPTIONS: SelectOption[] = [
  { value: "gpt-image-2", label: "gpt-image-2" },
  { value: "gpt-image-1.5", label: "gpt-image-1.5" },
  { value: "gpt-image-1", label: "gpt-image-1" },
  { value: "gpt-image-1-mini", label: "gpt-image-1-mini" },
];

export const QUALITY_OPTIONS: SelectOption[] = [
  { value: "auto", label: "Auto" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const SIZE_OPTIONS: SelectOption[] = [
  { value: "1024x1024", label: "1024 x 1024" },
  { value: "1536x1024", label: "1536 x 1024" },
  { value: "1024x1536", label: "1024 x 1536" },
  { value: "auto", label: "Auto" },
];
