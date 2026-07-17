import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../../api/resources";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { mediaQueryKey } from "./media-query-key";
import type { MediaBucket, MediaOut } from "../../types/api";

/**
 * Direct-to-device upload: opening the native file picker and uploading
 * whatever's selected immediately — no "browse previously uploaded images"
 * step anywhere in this flow. Shared by ImagePickerField,
 * MultiImagePickerField and SectionImageCard.
 */
export function useImageUpload(bucket: MediaBucket, onUploaded: (media: MediaOut) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);
      return mediaApi.upload(file, bucket, file.name, setProgress);
    },
    onSuccess: (res) => {
      setProgress(null);
      void queryClient.invalidateQueries({ queryKey: mediaQueryKey(bucket) });
      onUploaded(res.media);
    },
    onError: (err) => {
      setProgress(null);
      showToast({ title: "Upload failed", description: errorMessage(err), variant: "error" });
    },
  });

  function open() {
    if (!mutation.isPending) inputRef.current?.click();
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) mutation.mutate(file);
    e.target.value = "";
  }

  return {
    open,
    isUploading: mutation.isPending,
    progress,
    inputElement: (
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChange} tabIndex={-1} />
    ),
  };
}
