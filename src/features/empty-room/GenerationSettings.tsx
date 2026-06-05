import { SlidersHorizontal } from "lucide-react";
import { MODEL_OPTIONS, QUALITY_OPTIONS, SIZE_OPTIONS } from "./constants";
import type { GenerationSettingsValues } from "./types";

type Props = {
  settings: GenerationSettingsValues;
  onChange: (settings: GenerationSettingsValues) => void;
};

export function GenerationSettings({ settings, onChange }: Props) {
  return (
    <section className="rounded-lg border border-[#d9d7cd] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal aria-hidden="true" size={18} />
        <h2 className="text-base font-semibold">Generation settings</h2>
      </div>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-medium">
          Model
          <select
            className="rounded-md border border-[#c8c6bb] bg-white px-3 py-2"
            value={settings.model}
            onChange={(event) => onChange({ ...settings, model: event.target.value })}
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Quality
          <select
            className="rounded-md border border-[#c8c6bb] bg-white px-3 py-2"
            value={settings.quality}
            onChange={(event) => onChange({ ...settings, quality: event.target.value })}
          >
            {QUALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Size
          <select
            className="rounded-md border border-[#c8c6bb] bg-white px-3 py-2"
            value={settings.size}
            onChange={(event) => onChange({ ...settings, size: event.target.value })}
          >
            {SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Prompt
          <textarea
            className="min-h-32 resize-y rounded-md border border-[#c8c6bb] bg-white px-3 py-2 leading-6"
            value={settings.prompt}
            onChange={(event) => onChange({ ...settings, prompt: event.target.value })}
          />
        </label>
      </div>
    </section>
  );
}
