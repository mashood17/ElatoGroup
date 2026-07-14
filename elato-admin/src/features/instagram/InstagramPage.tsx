import { useQuery } from "@tanstack/react-query";
import { Camera as InstagramIcon, ExternalLink, Info } from "lucide-react";
import { instagramApi } from "../../api/resources";
import { Card, CardBody, CardHeader, CardGridSkeleton, EmptyState, ErrorState, PageHeader } from "../../components/ui";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";

export function InstagramPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["instagram-latest"],
    queryFn: instagramApi.latest,
  });

  return (
    <div>
      <PageHeader title="Instagram" description="Cached feed shown on the public site." />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-600">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
        <p>
          This feed refreshes via a scheduled backend job (<code className="rounded bg-neutral-100 px-1 py-0.5">POST /sync/instagram</code>),
          not from this screen — there's no manual refresh endpoint yet. What you see here is the current cache.
        </p>
      </div>

      <Card>
        <CardHeader title={data ? `${data.length} cached posts` : "Cached posts"} />
        <CardBody>
          {isLoading ? (
            <CardGridSkeleton count={8} />
          ) : isError ? (
            <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
          ) : !data || data.length === 0 ? (
            <EmptyState
              icon={InstagramIcon}
              title="No cached posts yet"
              description="The next scheduled sync will populate this feed."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img src={post.media_url} alt={post.caption ?? ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  </div>
                  {post.permalink && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 opacity-0 shadow transition-opacity group-hover:opacity-100">
                      <ExternalLink className="h-3 w-3 text-neutral-600" />
                    </span>
                  )}
                  <div className="px-2.5 py-2">
                    {post.caption && <p className="truncate text-xs text-neutral-600">{post.caption}</p>}
                    <p className="text-[11px] text-neutral-400">{formatDate(post.posted_at ?? post.fetched_at)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
