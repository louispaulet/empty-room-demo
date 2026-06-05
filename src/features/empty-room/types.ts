export type ImageStatus = "queued" | "processing" | "done" | "error";

export type RoomImage = {
  id: string;
  file: File;
  previewUrl: string;
  status: ImageStatus;
  outputUrl?: string;
  error?: string;
};

export type GenerationSettingsValues = {
  model: string;
  quality: string;
  size: string;
  prompt: string;
};

export type EmptyRoomResult = {
  image?: string;
  settings?: GenerationSettingsValues;
};

export type SelectOption = {
  value: string;
  label: string;
};
