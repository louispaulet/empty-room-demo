import { describe, expect, it } from "vitest";
import { buildOutputFilename, getPendingCount, getProcessableItems } from "./queue";
import type { RoomImage } from "./types";

function makeItem(status: RoomImage["status"], id = status): RoomImage {
  return {
    id,
    file: new File(["room"], `${id}.png`, { type: "image/png" }),
    previewUrl: `blob:${id}`,
    status,
  };
}

describe("empty room queue helpers", () => {
  it("counts queued and processing items as pending", () => {
    expect(getPendingCount([makeItem("queued"), makeItem("processing"), makeItem("done"), makeItem("error")])).toBe(2);
  });

  it("selects queued and failed items for processing", () => {
    const processable = getProcessableItems([
      makeItem("done", "done"),
      makeItem("queued", "queued"),
      makeItem("error", "error"),
      makeItem("processing", "processing"),
    ]);

    expect(processable.map((item) => item.id)).toEqual(["queued", "error"]);
  });

  it("builds stable png output filenames", () => {
    expect(buildOutputFilename("living-room.jpeg")).toBe("empty-living-room.png");
    expect(buildOutputFilename("room")).toBe("empty-room.png");
  });
});
