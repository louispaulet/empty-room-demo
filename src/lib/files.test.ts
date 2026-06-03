import { describe, expect, it } from "vitest";
import { validateRoomImage } from "./files";

function makeFile(name: string, type: string, size = 12): File {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
}

describe("validateRoomImage", () => {
  it("accepts supported room image types", () => {
    expect(validateRoomImage(makeFile("room.jpg", "image/jpeg")).ok).toBe(true);
    expect(validateRoomImage(makeFile("room.png", "image/png")).ok).toBe(true);
    expect(validateRoomImage(makeFile("room.webp", "image/webp")).ok).toBe(true);
  });

  it("rejects unsupported uploads", () => {
    const result = validateRoomImage(makeFile("notes.txt", "text/plain"));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("supported image");
  });
});
