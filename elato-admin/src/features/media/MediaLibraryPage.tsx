import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Library, Loader2, Search, Trash2 } from "lucide-react";
import { mediaApi } from "../../api/resources";
import {
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FileDropzone,
  Input,
  PageHeader,
  Pagination,
  Select,
  CardGridSkeleton,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";
import type { MediaBucket, MediaOut } from "../../types/api";

const BUCKETS: MediaBucket[] = ["menu-images", "gallery", "hero-assets", "rooms", "events", "avatars"];
const LIMIT = 40;

export function MediaLibraryPage() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [bucketFilter, setBucketFilter] = useState<string>("");
  const [uploadBucket, setUploadBucket] = useState<MediaBucket>("gallery");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<MediaOut | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["media-library", bucketFilter, offset],
    queryFn: () => mediaApi.list({ bucket: bucketFilter || undefined, limit: LIMIT, offset }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file, uploadBucket, file.name),
    onSuccess: () => {
      showToast({ title: "Uploaded", variant: "success" });
      void queryClient.invalidateQueries({ queryKey: ["media-library"] });
      void queryClient.invalidateQueries({ queryKey: ["media", uploadBucket] });
    },
    onError: (err) => showToast({ title: "Upload failed", description: errorMessage(err), variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Deleted", variant: "success" });
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["media-library"] });
    },
    onError: (err) => showToast({ title: "Couldn't delete", description: errorMessage(err), variant: "error" }),
  });

  function copyUrl(media: MediaOut) {
    void navigator.clipboard.writeText(media.url).then(() => {
      setCopiedId(media.id);
      window.setTimeout(() => setCopiedId((id) => (id === media.id ? null : id)), 1500);
    });
  }

  const items = (data?.items ?? []).filter((m) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (m.alt_text ?? "").toLowerCase().includes(needle) || m.storage_path.toLowerCase().includes(needle);
  });

  return (
    <div>
      <PageHeader title="Media Library" description="All uploaded assets, across every storage bucket." />

      <Card className="mb-4">
        <CardHeader title="Upload" description="Drops go straight into the bucket selected here." />
        <div className="flex flex-col gap-3 p-5 pt-0 sm:flex-row sm:items-start">
          <div className="w-full sm:w-56">
            <Select label="Target bucket" value={uploadBucket} onChange={(e) => setUploadBucket(e.target.value as MediaBucket)}>
              {BUCKETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <FileDropzone onFileSelected={(file) => uploadMutation.mutate(file)} disabled={uploadMutation.isPending} />
            {uploadMutation.isPending && (
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`${data?.total ?? "…"} assets`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search alt text or filename…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 pl-8"
                  aria-label="Search media"
                />
              </div>
              <Select
                value={bucketFilter}
                onChange={(e) => {
                  setBucketFilter(e.target.value);
                  setOffset(0);
                }}
                aria-label="Filter by bucket"
                className="w-44"
              >
                <option value="">All buckets</option>
                {BUCKETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>
          }
        />
        <div className="p-4">
          {isLoading ? (
            <CardGridSkeleton count={12} />
          ) : isError ? (
            <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EmptyState icon={Library} title="No media found" description="Try a different bucket or search term, or upload a new asset above." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((media) => (
                <div key={media.id} className="group overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                    <img src={media.url} alt={media.alt_text ?? ""} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="truncate text-xs font-medium text-neutral-700" title={media.alt_text ?? media.storage_path}>
                      {media.alt_text || media.storage_path}
                    </p>
                    <p className="truncate text-[11px] text-neutral-400">
                      {media.bucket} · {formatDate(media.created_at)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[11px]" onClick={() => copyUrl(media)}>
                        {copiedId === media.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copiedId === media.id ? "Copied" : "Copy URL"}
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[11px] text-red-600 hover:text-red-700"
                          onClick={() => setDeleteTarget(media)}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {data && <Pagination total={data.total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this asset?"
        description="If it's still referenced by a menu item, special, room or gallery photo, that reference will start pointing at a missing image."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
