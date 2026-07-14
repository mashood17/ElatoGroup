import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { mediaApi } from "../../api/resources";
import { MediaPickerModal } from "./MediaPickerModal";
import { mediaQueryKey } from "./media-query-key";
import { Button, FieldShell } from "../../components/ui";
import type { MediaBucket, MediaOut } from "../../types/api";

/**
 * Single-image field: shows the current selection's thumbnail and opens
 * MediaPickerModal to change it. There's no `GET /admin/media/{id}`
 * endpoint on the backend, so resolving `imageId` to a thumbnail works by
 * matching it against the bucket's list (capped at 100 items, the API's
 * page-size ceiling) — good enough for these per-bucket asset counts, but
 * worth flagging if a bucket ever exceeds 100 images.
 */
export function ImagePickerField({
  label,
  bucket,
  imageId,
  onChange,
}: {
  label?: string;
  bucket: MediaBucket;
  imageId: string | null;
  onChange: (mediaId: string | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data } = useQuery({
    queryKey: mediaQueryKey(bucket),
    queryFn: () => mediaApi.list({ bucket, limit: 100 }),
  });

  const current = imageId ? data?.items.find((m) => m.id === imageId) : undefined;

  return (
    <FieldShell label={label}>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          {current ? (
            <img src={current.url} alt={current.alt_text ?? ""} className="h-full w-full object-cover" />
          ) : imageId ? (
            <span className="px-1 text-center text-[10px] text-neutral-400">Selected</span>
          ) : (
            <ImagePlus className="h-5 w-5 text-neutral-300" />
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            {imageId ? "Change" : "Choose image"}
          </Button>
          {imageId && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      </div>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bucket={bucket}
        onSelect={(media: MediaOut) => {
          onChange(media.id);
          setPickerOpen(false);
        }}
      />
    </FieldShell>
  );
}
