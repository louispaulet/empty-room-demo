type Env = {
  OPENAI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_PROMPT =
  "Please remove the furniture and most of the objects so that only the walls, floors, and windows remain in this picture.";
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_QUALITY = "high";
const DEFAULT_SIZE = "1024x1024";
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_MODELS = new Set(["gpt-image-2", "gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini"]);
const ALLOWED_QUALITIES = new Set(["auto", "high", "medium", "low"]);
const ALLOWED_SIZES = new Set(["auto", "1024x1024", "1536x1024", "1024x1536"]);
const MAX_PROMPT_LENGTH = 32000;

export function getAllowedOrigins(env: Env): string[] {
  const configured = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://louispaulet.github.io",
    ...configured,
  ];
}

export function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigins[0] ?? "http://127.0.0.1:5173";
  }

  return headers;
}

function jsonResponse(request: Request, env: Env, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, env),
    },
  });
}

function cleanSetting(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function cleanChoice(value: FormDataEntryValue | null, fallback: string, allowed: Set<string>): string | null {
  const cleaned = cleanSetting(value, fallback);
  return allowed.has(cleaned) ? cleaned : null;
}

async function handleEmptyRoom(request: Request, env: Env): Promise<Response> {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse(request, env, 500, { error: "OpenAI API key is not configured for the Worker." });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse(request, env, 400, { error: "Expected multipart form data." });
  }

  const image = form.get("image");
  if (!(image instanceof File)) {
    return jsonResponse(request, env, 400, { error: "Upload one room image as the `image` field." });
  }

  if (!SUPPORTED_TYPES.has(image.type)) {
    return jsonResponse(request, env, 415, { error: "Use a JPG, PNG, or WebP room image." });
  }

  const prompt = cleanSetting(form.get("prompt"), DEFAULT_PROMPT);
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonResponse(request, env, 400, { error: "Prompt is too long for GPT Image models." });
  }

  const model = cleanChoice(form.get("model"), DEFAULT_MODEL, ALLOWED_MODELS);
  const quality = cleanChoice(form.get("quality"), DEFAULT_QUALITY, ALLOWED_QUALITIES);
  const size = cleanChoice(form.get("size"), DEFAULT_SIZE, ALLOWED_SIZES);

  if (!model) {
    return jsonResponse(request, env, 400, {
      error: "Unsupported image model. Use gpt-image-2, gpt-image-1.5, gpt-image-1, or gpt-image-1-mini.",
    });
  }
  if (!quality) {
    return jsonResponse(request, env, 400, { error: "Unsupported image quality. Use auto, high, medium, or low." });
  }
  if (!size) {
    return jsonResponse(request, env, 400, { error: "Unsupported image size. Use auto, 1024x1024, 1536x1024, or 1024x1536." });
  }

  const openAIForm = new FormData();
  openAIForm.append("image", image, image.name || "room.png");
  openAIForm.append("prompt", prompt);
  openAIForm.append("model", model);
  openAIForm.append("quality", quality);
  openAIForm.append("size", size);
  openAIForm.append("output_format", "png");

  const openAIResponse = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: openAIForm,
  });

  const payload = (await openAIResponse.json().catch(() => ({}))) as OpenAIImageResponse;
  if (!openAIResponse.ok) {
    return jsonResponse(request, env, openAIResponse.status, {
      error: payload.error?.message ?? "OpenAI could not edit this room image.",
    });
  }

  const firstImage = payload.data?.[0];
  if (!firstImage?.b64_json && !firstImage?.url) {
    return jsonResponse(request, env, 502, { error: "OpenAI returned no image output." });
  }

  return jsonResponse(request, env, 200, {
    image: firstImage.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : firstImage.url,
    settings: { model, quality, size, prompt },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (url.pathname !== "/api/empty-room") {
      return jsonResponse(request, env, 404, { error: "Not found." });
    }

    if (request.method !== "POST") {
      return jsonResponse(request, env, 405, { error: "Use POST /api/empty-room." });
    }

    try {
      return await handleEmptyRoom(request, env);
    } catch (error) {
      console.error(JSON.stringify({ message: "empty-room-worker-error", error: String(error) }));
      return jsonResponse(request, env, 500, { error: "The room image could not be processed." });
    }
  },
};
