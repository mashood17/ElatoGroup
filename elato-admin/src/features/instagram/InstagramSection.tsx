import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera as InstagramIcon, ExternalLink, RefreshCw } from "lucide-react";
import { instagramApi } from "../../api/resources";
import { Badge, Button, Card, CardBody, CardHeader, CardGridSkeleton, EmptyState, ErrorState } from "../../components/ui";
import type { BadgeTone } from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDateTime } from "../../lib/utils";

const STATUS_QUERY_KEY = ["instagram-status"];
const REELS_QUERY_KEY = ["instagram-reels"];

const CONNECTION_TONE: Record<"connected" | "not_connected" | "error", BadgeTone> = {
  connected: "success",
  not_connected: "neutral",
  error: "danger",
};

/** Instagram Integration — read-only sync status plus a "Sync Now" button.
 * Reels are imported automatically from the connected Instagram Business
 * account via the Meta Graph API (see elato-backend/app/services/instagram_service.py);
 * nothing here lets an admin create, edit, or paste in a reel by hand. */
export function InstagramSection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const statusQuery = useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: () => instagramApi.getStatus(),
  });

  const reelsQuery = useQuery({
    queryKey: REELS_QUERY_KEY,
    queryFn: () => instagramApi.listReels({ limit: 100, offset: 0 }),
  });

  const syncMutation = useMutation({
    mutationFn: () => instagramApi.syncNow(),
    onSuccess: (status) => {
      queryClient.setQueryData(STATUS_QUERY_KEY, status);
      void queryClient.invalidateQueries({ queryKey: REELS_QUERY_KEY });
      showToast({
        title: status.last_sync_status === "error" ? "Sync finished with an error" : "Sync complete",
        description: status.last_sync_status === "error" ? (status.last_sync_error ?? undefined) : undefined,
        variant: status.last_sync_status === "error" ? "error" : "success",
      });
    },
    onError: (err) => showToast({ title: "Couldn't run sync", description: errorMessage(err), variant: "error" }),
  });

  const status = statusQuery.data;
  const connectionState = !status?.connected ? "not_connected" : status.last_sync_status === "error" ? "error" : "connected";
  const connectionLabel =
    connectionState === "connected" ? "Connected" : connectionState === "error" ? "Connected — last sync failed" : "Not connected";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Instagram Integration"
          description="Reels are imported automatically from your Instagram Business account. Upload new Reels on Instagram — nothing to do here except sync."
          actions={
            <Button size="sm" variant="outline" onClick={() => syncMutation.mutate()} isLoading={syncMutation.isPending}>
              <RefreshCw className="h-3.5 w-3.5" /> Sync Now
            </Button>
          }
        />
        <CardBody>
          {statusQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-skeleton rounded-lg bg-neutral-200" />
              ))}
            </div>
          ) : statusQuery.isError ? (
            <ErrorState description={errorMessage(statusQuery.error)} onRetry={() => void statusQuery.refetch()} />
          ) : (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <dt className="text-xs text-neutral-500">Connection status</dt>
                <dd className="mt-1">
                  <Badge tone={CONNECTION_TONE[connectionState]}>{connectionLabel}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Instagram account</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900">
                  {status?.account_username ? `@${status.account_username}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Last successful sync</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900">{formatDateTime(status?.last_synced_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Imported reels</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900">{status?.imported_reels_count ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Auto sync</dt>
                <dd className="mt-1">
                  <Badge tone={status?.auto_sync_enabled ? "success" : "neutral"}>
                    {status?.auto_sync_enabled ? "Enabled" : "Not configured"}
                  </Badge>
                </dd>
              </div>
            </dl>
          )}
          {!statusQuery.isLoading && !statusQuery.isError && !status?.auto_sync_enabled && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              INSTAGRAM_GRAPH_TOKEN / INSTAGRAM_BUSINESS_ID aren't configured on the backend yet — reels won't sync until they are.
            </p>
          )}
          {!statusQuery.isLoading && !statusQuery.isError && status?.last_sync_status === "error" && status.last_sync_error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">{status.last_sync_error}</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Imported Reels"
          description={reelsQuery.data ? `${reelsQuery.data.total} reel${reelsQuery.data.total === 1 ? "" : "s"} shown on the public site` : undefined}
        />
        <CardBody>
          {reelsQuery.isLoading ? (
            <CardGridSkeleton count={8} />
          ) : reelsQuery.isError ? (
            <ErrorState description={errorMessage(reelsQuery.error)} onRetry={() => void reelsQuery.refetch()} />
          ) : !reelsQuery.data || reelsQuery.data.items.length === 0 ? (
            <EmptyState
              icon={InstagramIcon}
              title="No reels yet"
              description="Upload a Reel to your Instagram Business account, then hit Sync Now."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {reelsQuery.data.items.map((post) => (
                <div key={post.id} className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                    <img src={post.thumbnail_url ?? post.media_url} alt={post.caption ?? ""} className="h-full w-full object-cover" loading="lazy" />
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
                      <p className="text-[11px] text-neutral-400">{formatDateTime(post.posted_at)}</p>
                    </div>
                    <Badge tone={post.import_status === "synced" ? "info" : "neutral"} className="shrink-0">
                      {post.import_status === "synced" ? "Synced" : "Legacy"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
