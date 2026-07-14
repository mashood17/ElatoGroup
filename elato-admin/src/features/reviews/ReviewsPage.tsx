import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { reviewsApi } from "../../api/resources";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  TableSkeleton,
  Thead,
  Tr,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";

const LIMIT = 50;

export function ReviewsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["reviews", offset],
    queryFn: () => reviewsApi.list({ limit: LIMIT, offset }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) => reviewsApi.update(id, { is_featured }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["reviews"] }),
    onError: (err) => showToast({ title: "Couldn't update review", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <PageHeader title="Reviews" description="Synced from Google — toggle which ones appear on the public site." />

      <Card>
        <CardHeader title={`${data?.total ?? "…"} reviews`} description="Read-only content; only the featured flag is editable here." />
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Reviews sync automatically from Google via a scheduled backend job — check back after the next sync."
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Author</Th>
                <Th>Rating</Th>
                <Th>Review</Th>
                <Th>Fetched</Th>
                <Th>Featured</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((review) => (
                <Tr key={review.id}>
                  <Td className="font-medium text-neutral-800">{review.author_name ?? "Anonymous"}</Td>
                  <Td>
                    {review.rating != null ? (
                      <span className="inline-flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" /> {review.rating}
                      </span>
                    ) : (
                      <Badge tone="neutral">—</Badge>
                    )}
                  </Td>
                  <Td className="max-w-md truncate text-neutral-600" title={review.text ?? ""}>
                    {review.text ?? "—"}
                  </Td>
                  <Td className="text-xs text-neutral-400">{formatDate(review.fetched_at)}</Td>
                  <Td>
                    <Switch
                      checked={review.is_featured}
                      onChange={(v) => featureMutation.mutate({ id: review.id, is_featured: v })}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
        {data && <Pagination total={data.total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />}
      </Card>
    </div>
  );
}
