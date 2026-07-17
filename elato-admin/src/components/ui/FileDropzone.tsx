import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "../../lib/utils";

export function FileDropzone({
  onFileSelected,
  accept = "image/*",
  disabled,
  hint = "PNG, JPG or WEBP",
}: {
  onFileSelected: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-disabled={disabled}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragging ? "border-accent-500 bg-accent-50" : "border-neutral-200 bg-neutral-50/60 hover:border-accent-300 hover:bg-accent-50/40",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-elevation-sm">
        <UploadCloud className="h-5 w-5 text-accent-600" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-neutral-700">Drop a file here, or click to browse</p>
      <p className="text-xs text-neutral-400">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
