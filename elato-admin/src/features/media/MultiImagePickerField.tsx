import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { mediaApi } from "../../api/resources";
import { MediaPickerModal } from "./MediaPickerModal";
import { mediaQueryKey } from "./media-query-key";
import { FieldShell } from "../../components/ui";
import type { MediaBucket, MediaOut } from "../../types/api";

/** Multi-image field for Rooms — a strip of chosen thumbnails plus an "Add" tile. */
export function MultiImagePickerField({
  label,
  bucket,
  imageIds,
  onChange,
}: {
  label?: string;
  bucket: MediaBucket;
  imageIds: string[];
  onChange: (mediaIds: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data } = useQuery({
    queryKey: mediaQueryKey(bucket),
    queryFn: () => mediaApi.list({ bucket, limit: 100 }),
  });

  const byId = new Map((data?.items ?? []).map((m) => [m.id, m]));

  return (
    <FieldShell label={label}>
      <div className="flex flex-wrap gap-2">
        {imageIds.map((id) => {
          const media = byId.get(id);
          return (
            <div key={id} className="group relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
              {media ? (
                <img src={media.url} alt={media.alt_text ?? ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">Selected</div>
              )}
              <button
                type="button"
                onClick={() => onChange(imageIds.filter((existing) => existing !== id))}
                aria-label="Remove image"
                className="absolute right-0.5 top-0.5 rounded-full bg-neutral-900/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-400 hover:border-accent-400 hover:text-accent-600"
          aria-label="Add image"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
      </div>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bucket={bucket}
        onSelect={(media: MediaOut) => {
          if (!imageIds.includes(media.id)) onChange([...imageIds, media.id]);
          setPickerOpen(false);
        }}
      />
    </FieldShell>
  );
}
