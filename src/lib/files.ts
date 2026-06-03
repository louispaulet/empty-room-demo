export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024;

export type FileValidation = {
  ok: boolean;
  message?: string;
};

export function validateRoomImage(file: File): FileValidation {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: `${file.name} is not a supported image. Use JPG, PNG, or WebP.`,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: `${file.name} is larger than 50 MB.`,
    };
  }

  return { ok: true };
}
