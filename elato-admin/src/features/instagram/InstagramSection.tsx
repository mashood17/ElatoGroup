import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera as InstagramIcon, ExternalLink, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { instagramApi } from "../../api/resources";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardGridSkeleton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Textarea,
} from "../../components/ui";
import { useImageUpload } from "../media/useImageUpload";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";
import type { InstagramPostOut } from "../../types/api";

const QUERY_KEY = ["instagram-posts"];

/** Instagram reel management, embedded as a section on the Homepage page
 * (no dedicated nav entry) — paste the Reel URL and upload a cover image
 * yourself, nothing is auto-fetched from Instagram. */
export function InstagramSection() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => instagramApi.list({ limit: 100, offset: 0 }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InstagramPostOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstagramPostOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => instagramApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Reel deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete reel", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <Card>
        <CardHeader
          title="Instagram Reels"
          description={data ? `${data.total} reel${data.total === 1 ? "" : "s"} shown on the public site` : undefined}
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Reel
            </Button>
          }
        />
        <CardBody>
          {isLoading ? (
            <CardGridSkeleton count={8} />
          ) : isError ? (
            <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={InstagramIcon}
              title="No reels yet"
              description="Add a reel to feature it on the public site."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add Reel
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.items.map((post) => (
                <div key={post.id} className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                    <img src={post.media_url} alt={post.caption ?? ""} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  {post.permalink && (
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-neutral-600 opacity-0 shadow-elevation-sm transition-opacity group-hover:opacity-100"
                      aria-label="Open on Instagram"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                    <div className="min-w-0">
                      {post.caption && <p className="truncate text-xs text-neutral-600">{post.caption}</p>}
                      <p className="text-[11px] text-neutral-400">{formatDate(post.posted_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Edit reel"
                        onClick={() => {
                          setEditing(post);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Delete reel"
                          onClick={() => setDeleteTarget(post)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <ReelFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        post={editing}
        onSaved={() => {
          setFormOpen(false);
          void invalidate();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this reel?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function ReelFormModal({
  open,
  onClose,
  post,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  post: InstagramPostOut | null;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [permalink, setPermalink] = useState("");
  const [caption, setCaption] = useState("");
  const [newMediaId, setNewMediaId] = useState<string | null>(null);
  const [newMediaUrl, setNewMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPermalink(post?.permalink ?? "");
      setCaption(post?.caption ?? "");
      setNewMediaId(null);
      setNewMediaUrl(null);
    }
  }, [open, post]);

  const { open: openPicker, isUploading, progress, inputElement } = useImageUpload("public-assets", (media) => {
    setNewMediaId(media.id);
    setNewMediaUrl(media.url);
  });

  const previewUrl = newMediaUrl ?? post?.media_url;
  const canSubmit = !!permalink && (!!post || !!newMediaId);

  const mutation = useMutation({
    mutationFn: () => {
      if (post) {
        return instagramApi.update(post.id, {
          permalink,
          caption: caption || null,
          ...(newMediaId ? { media_id: newMediaId } : {}),
        });
      }
      if (!newMediaId) throw new Error("Upload a cover image first.");
      return instagramApi.create({ permalink, media_id: newMediaId, caption: caption || null });
    },
    onSuccess: () => {
      showToast({ title: post ? "Reel updated" : "Reel added", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save reel", description: errorMessage(err), variant: "error" }),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={post ? "Edit reel" : "Add Reel"}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!canSubmit}>
            Save
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          label="Reel URL"
          required
          value={permalink}
          onChange={(e) => setPermalink(e.target.value)}
          placeholder="https://www.instagram.com/reel/…"
        />

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-neutral-700">
            Cover image{!post && <span className="ml-0.5 text-accent-600">*</span>}
          </p>
          {inputElement}
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-neutral-300" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={openPicker} isLoading={isUploading}>
                {previewUrl ? "Replace" : "Add Image"}
              </Button>
              {isUploading && (
                <p className="text-xs text-neutral-400">Uploading{progress !== null ? ` — ${progress}%` : "…"}</p>
              )}
            </div>
          </div>
        </div>

        <Textarea label="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
      </form>
    </Modal>
  );
}
