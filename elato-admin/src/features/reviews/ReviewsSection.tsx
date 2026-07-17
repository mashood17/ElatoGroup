import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { reviewsApi } from "../../api/resources";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Pagination,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  TableSkeleton,
  Textarea,
  Thead,
  Tr,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";
import type { ReviewOut } from "../../types/api";

const LIMIT = 50;

/** Review management, embedded as a section on the Homepage page (no
 * dedicated nav entry) — add, edit, delete and feature reviews. */
export function ReviewsSection() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["reviews", offset],
    queryFn: () => reviewsApi.list({ limit: LIMIT, offset }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["reviews"] });

  const featureMutation = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) => reviewsApi.update(id, { is_featured }),
    onSuccess: () => void invalidate(),
    onError: (err) => showToast({ title: "Couldn't update review", description: errorMessage(err), variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Review deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete review", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <Card>
        <CardHeader
          title="Reviews"
          description="Edit, add or remove reviews and choose which ones are featured."
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add review
            </Button>
          }
        />
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Add a review to feature it on the public site."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add review
              </Button>
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Author</Th>
                <Th>Rating</Th>
                <Th>Review</Th>
                <Th>Date</Th>
                <Th>Featured</Th>
                <Th className="text-right">Actions</Th>
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
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit review by ${review.author_name ?? "Anonymous"}`}
                      onClick={() => {
                        setEditing(review);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete review by ${review.author_name ?? "Anonymous"}`}
                        onClick={() => setDeleteTarget(review)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
        {data && <Pagination total={data.total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />}
      </Card>

      <ReviewFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        review={editing}
        onSaved={() => {
          setFormOpen(false);
          void invalidate();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete this review${deleteTarget?.author_name ? ` by ${deleteTarget.author_name}` : ""}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function ReviewFormModal({
  open,
  onClose,
  review,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  review: ReviewOut | null;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (open) {
      setAuthorName(review?.author_name ?? "");
      setRating(review?.rating != null ? String(review.rating) : "5");
      setText(review?.text ?? "");
      setIsFeatured(review?.is_featured ?? false);
    }
  }, [open, review]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        author_name: authorName || null,
        rating: rating ? Number(rating) : null,
        text: text || null,
        is_featured: isFeatured,
      };
      return review ? reviewsApi.update(review.id, payload) : reviewsApi.create(payload);
    },
    onSuccess: () => {
      showToast({ title: review ? "Review updated" : "Review added", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save review", description: errorMessage(err), variant: "error" }),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={review ? "Edit review" : "Add review"}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
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
        <Input label="Author name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        <Select label="Rating" value={rating} onChange={(e) => setRating(e.target.value)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </Select>
        <Textarea label="Review text" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <Switch checked={isFeatured} onChange={setIsFeatured} label="Featured on the public site" />
      </form>
    </Modal>
  );
}
