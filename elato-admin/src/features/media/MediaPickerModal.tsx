import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ImageOff, Loader2 } from "lucide-react";
import { mediaApi } from "../../api/resources";
import { EmptyState, ErrorState, FileDropzone, Modal } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { cn } from "../../lib/utils";
import { mediaQueryKey } from "./media-query-key";
import type { MediaBucket, MediaOut } from "../../types/api";

/** Modal grid for picking (or uploading) a single media item scoped to one
 * storage bucket. Shared by Menu, Specials, Events and Rooms image fields,
 * and by Gallery's media_id field. */
export function MediaPickerModal({
  open,
  onClose,
  bucket,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  bucket: MediaBucket;
  onSelect: (media: MediaOut) => void;
}) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: mediaQueryKey(bucket),
    queryFn: () => mediaApi.list({ bucket, limit: 100 }),
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      setUploadPct(0);
      return mediaApi.upload(file, bucket, file.name, setUploadPct);
    },
    onSuccess: (res) => {
      setUploadPct(null);
      void queryClient.invalidateQueries({ queryKey: mediaQueryKey(bucket) });
      showToast({ title: "Image uploaded", variant: "success" });
      onSelect(res.media);
    },
    onError: (err) => {
      setUploadPct(null);
      showToast({ title: "Upload failed", description: errorMessage(err), variant: "error" });
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Choose an image" size="lg">
      <div className="flex flex-col gap-4">
        <FileDropzone
          onFileSelected={(file) => uploadMutation.mutate(file)}
          disabled={uploadMutation.isPending}
          hint={`Uploads to the "${bucket}" bucket`}
        />
        {uploadMutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading{uploadPct !== null ? ` — ${uploadPct}%` : "…"}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-skeleton rounded-md bg-neutral-200" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={ImageOff} title="No images in this bucket yet" description="Upload one above to use it here." />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {data.items.map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => onSelect(media)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-100",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
                )}
                title={media.alt_text ?? media.storage_path}
              >
                <img src={media.url} alt={media.alt_text ?? ""} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute inset-0 hidden items-center justify-center bg-neutral-900/40 group-hover:flex">
                  <Check className="h-5 w-5 text-white" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
