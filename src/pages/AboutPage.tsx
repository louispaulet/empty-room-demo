import { KeyRound, Layers, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AboutPage() {
  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-[#d9d7cd] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7a3f2a]">About the demo</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-[#1d1d1b] sm:text-4xl">
          A small image-editing workflow with a deliberately boring security model.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#626158]">
          The browser handles uploads, previews, and downloads. The Cloudflare Worker receives each image, forwards the edit
          request to OpenAI, and returns the generated empty-room image without exposing the API key to the client.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={<Sparkles aria-hidden="true" size={22} />}
          title="What it does"
          text="Removes furniture and loose objects from room photos so the remaining walls, floors, and windows are easier to inspect."
        />
        <InfoCard
          icon={<ShieldCheck aria-hidden="true" size={22} />}
          title="What stays private"
          text="The OpenAI API key is stored as a Worker secret and is never bundled into the public Vite app."
        />
        <InfoCard
          icon={<Layers aria-hidden="true" size={22} />}
          title="How it is split"
          text="The frontend is a static React app. The backend is a single Worker endpoint at /api/empty-room."
        />
        <InfoCard
          icon={<KeyRound aria-hidden="true" size={22} />}
          title="What you need"
          text="Local development needs .env.local with OPENAI_API_KEY. Deployment needs Wrangler auth and a deployed Worker URL."
        />
      </div>
    </section>
  );
}

function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-xl border border-[#d9d7cd] bg-[#fdfdfb] p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#dde8ea] text-[#24505c]">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[#1d1d1b]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#626158]">{text}</p>
    </article>
  );
}
