import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { specialsApi } from "../../api/resources";
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
  PageHeader,
  Pagination,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  TableSkeleton,
  Thead,
  Textarea,
  Tr,
} from "../../components/ui";
import { ImagePickerField } from "../media/ImagePickerField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";
import type { SpecialOut } from "../../types/api";

const LIMIT = 50;

function specialStatus(special: SpecialOut): { label: string; tone: "success" | "neutral" | "warning" } {
  if (!special.is_active) return { label: "Inactive", tone: "neutral" };
  const today = new Date().toISOString().slice(0, 10);
  if (special.active_from && special.active_from > today) return { label: "Scheduled", tone: "warning" };
  if (special.active_to && special.active_to < today) return { label: "Expired", tone: "neutral" };
  return { label: "Active", tone: "success" };
}

export function SpecialsPage() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["specials", offset],
    queryFn: () => specialsApi.list({ limit: LIMIT, offset }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpecialOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["specials"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => specialsApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Special deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete special", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <PageHeader
        title="Specials"
        description="Time-boxed promotions shown on the public site."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add special
          </Button>
        }
      />

      <Card>
        <CardHeader title={`${data?.total ?? "…"} specials`} />
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No specials yet"
            description="Create a limited-time offer to feature it on the public site."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add special
              </Button>
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Active window</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((special) => {
                const status = specialStatus(special);
                return (
                  <Tr key={special.id}>
                    <Td className="font-medium text-neutral-800">{special.title}</Td>
                    <Td className="text-xs text-neutral-500">
                      {special.active_from || special.active_to
                        ? `${formatDate(special.active_from)} – ${formatDate(special.active_to)}`
                        : "Always on"}
                    </Td>
                    <Td>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </Td>
                    <Td className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${special.title}`}
                        onClick={() => {
                          setEditing(special);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {canDelete && (
                        <Button variant="ghost" size="icon" aria-label={`Delete ${special.title}`} onClick={() => setDeleteTarget(special)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
        {data && <Pagination total={data.total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />}
      </Card>

      <SpecialFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        special={editing}
        onSaved={() => {
          setFormOpen(false);
          void invalidate();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function SpecialFormModal({
  open,
  onClose,
  special,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  special: SpecialOut | null;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageId, setImageId] = useState<string | null>(null);
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setTitle(special?.title ?? "");
      setDescription(special?.description ?? "");
      setImageId(special?.image_id ?? null);
      setActiveFrom(special?.active_from ?? "");
      setActiveTo(special?.active_to ?? "");
      setIsActive(special?.is_active ?? true);
    }
  }, [open, special]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title,
        description: description || null,
        image_id: imageId,
        active_from: activeFrom || null,
        active_to: activeTo || null,
        is_active: isActive,
      };
      return special ? specialsApi.update(special.id, payload) : specialsApi.create(payload);
    },
    onSuccess: () => {
      showToast({ title: special ? "Special updated" : "Special created", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save special", description: errorMessage(err), variant: "error" }),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={special ? "Edit special" : "Add special"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!title}>
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
        <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Active from" type="date" value={activeFrom} onChange={(e) => setActiveFrom(e.target.value)} />
          <Input label="Active to" type="date" value={activeTo} onChange={(e) => setActiveTo(e.target.value)} />
        </div>
        <ImagePickerField label="Image" bucket="menu" imageId={imageId} onChange={setImageId} />
        <Switch checked={isActive} onChange={setIsActive} label="Active" />
      </form>
    </Modal>
  );
}
