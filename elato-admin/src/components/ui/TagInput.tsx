import { useState } from "react";
import type { KeyboardEvent } from "react";
import { X } from "lucide-react";
import { FieldShell } from "./Field";

/** Free-text tag entry (used for room amenities) — type + Enter/comma to add. */
export function TagInput({
  value,
  onChange,
  label,
  placeholder = "Type and press Enter…",
  hint,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <FieldShell label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 shadow-elevation-sm transition-all focus-within:border-accent-500 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-accent-500/25">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="rounded-full text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[8ch] flex-1 border-none bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-neutral-400"
        />
      </div>
    </FieldShell>
  );
}
