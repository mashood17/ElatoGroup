import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  accent: "bg-accent-100 text-accent-800",
  info: "bg-sky-100 text-sky-800",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium leading-5",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
