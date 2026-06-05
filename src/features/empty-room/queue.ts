import type { ImageStatus, RoomImage } from "./types";

const PENDING_STATUSES = new Set<ImageStatus>(["queued", "processing"]);
const PROCESSABLE_STATUSES = new Set<ImageStatus>(["queued", "error"]);

export function getPendingCount(items: Pick<RoomImage, "status">[]): number {
  return items.filter((item) => PENDING_STATUSES.has(item.status)).length;
}

export function getProcessableItems<T extends Pick<RoomImage, "status">>(items: T[]): T[] {
  return items.filter((item) => PROCESSABLE_STATUSES.has(item.status));
}

export function buildOutputFilename(filename: string): string {
  return `empty-${filename.replace(/\.[^.]+$/, "")}.png`;
}
