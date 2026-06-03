import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { corsHeaders } from "./index";

const env = {
  OPENAI_API_KEY: "test-key",
  ALLOWED_ORIGINS: "https://louispaulet.github.io",
};

function roomFile(type = "image/png") {
  return new File([new Blob(["room"], { type })], "room.png", { type });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("empty room worker", () => {
  it("returns preflight CORS headers for allowed origins", () => {
    const request = new Request("https://api.example.com/api/empty-room", {
      method: "OPTIONS",
      headers: { Origin: "https://louispaulet.github.io" },
    });

    const headers = new Headers(corsHeaders(request, env));
    expect(headers.get("Access-Control-Allow-Origin")).toBe("https://louispaulet.github.io");
    expect(headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("rejects missing images", async () => {
    const response = await worker.fetch(
      new Request("https://api.example.com/api/empty-room", {
        method: "POST",
        body: new FormData(),
      }),
      env,
    );
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toContain("image");
  });

  it("rejects unsupported methods", async () => {
    const response = await worker.fetch(new Request("https://api.example.com/api/empty-room"), env);
    expect(response.status).toBe(405);
  });

  it("converts successful OpenAI base64 output into a data URL", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: [{ b64_json: "abc123" }],
      }),
    );
    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const form = new FormData();
    form.append("image", roomFile());
    form.append("prompt", "remove furniture");

    const response = await worker.fetch(
      new Request("https://api.example.com/api/empty-room", {
        method: "POST",
        body: form,
      }),
      env,
    );
    const body = (await response.json()) as { image: string };

    expect(response.status).toBe(200);
    expect(body.image).toBe("data:image/png;base64,abc123");

    const openAICall = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const openAIForm = openAICall[1].body as FormData;
    expect(openAIForm.get("model")).toBe("gpt-image-2");
    expect(openAIForm.get("output_format")).toBe("png");
  });

  it("accepts gpt-image-2 as the top image model", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: [{ b64_json: "abc123" }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const form = new FormData();
    form.append("image", roomFile());
    form.append("model", "gpt-image-2");

    const response = await worker.fetch(
      new Request("https://api.example.com/api/empty-room", {
        method: "POST",
        body: form,
      }),
      env,
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects unknown image models before calling OpenAI", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const form = new FormData();
    form.append("image", roomFile());
    form.append("model", "gpt-image-9");

    const response = await worker.fetch(
      new Request("https://api.example.com/api/empty-room", {
        method: "POST",
        body: form,
      }),
      env,
    );
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toContain("Unsupported image model");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns safe OpenAI errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            error: { message: "model is unavailable" },
          },
          { status: 400 },
        ),
      ),
    );

    const form = new FormData();
    form.append("image", roomFile());

    const response = await worker.fetch(
      new Request("https://api.example.com/api/empty-room", {
        method: "POST",
        body: form,
      }),
      env,
    );
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe("model is unavailable");
  });
});
