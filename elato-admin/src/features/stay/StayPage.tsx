import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, BedDouble } from "lucide-react";
import { roomsApi } from "../../api/resources";
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
  TagInput,
  Tbody,
  Td,
  Th,
  TableSkeleton,
  Thead,
  Textarea,
  Tr,
} from "../../components/ui";
import { MultiImagePickerField } from "../media/MultiImagePickerField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import type { RoomOut } from "../../types/api";

const LIMIT = 50;

export function StayPage() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rooms", offset],
    queryFn: () => roomsApi.list({ limit: LIMIT, offset }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["rooms"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Room deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete room", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <PageHeader
        title="Stay"
        description="Rooms available for booking, shown on the public site."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add room
          </Button>
        }
      />

      <Card>
        <CardHeader title={`${data?.total ?? "…"} rooms`} />
        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No rooms yet"
            description="Add a room to make it bookable from the public site."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add room
              </Button>
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Capacity</Th>
                <Th>Amenities</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((room) => (
                <Tr key={room.id}>
                  <Td className="font-medium text-neutral-800">{room.name}</Td>
                  <Td className="text-xs text-neutral-500">{room.capacity ?? "—"}</Td>
                  <Td className="text-xs text-neutral-500">
                    {room.amenities.length > 0 ? room.amenities.slice(0, 3).join(", ") + (room.amenities.length > 3 ? "…" : "") : "—"}
                  </Td>
                  <Td>
                    <Badge tone={room.is_active ? "success" : "neutral"}>{room.is_active ? "Active" : "Inactive"}</Badge>
                  </Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${room.name}`}
                      onClick={() => {
                        setEditing(room);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {canDelete && (
                      <Button variant="ghost" size="icon" aria-label={`Delete ${room.name}`} onClick={() => setDeleteTarget(room)}>
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

      <RoomFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        room={editing}
        onSaved={() => {
          setFormOpen(false);
          void invalidate();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function RoomFormModal({
  open,
  onClose,
  room,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  room: RoomOut | null;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(room?.name ?? "");
      setDescription(room?.description ?? "");
      setCapacity(room?.capacity != null ? String(room.capacity) : "");
      setAmenities(room?.amenities ?? []);
      setImageIds(room?.image_ids ?? []);
      setIsActive(room?.is_active ?? true);
    }
  }, [open, room]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        description: description || null,
        capacity: capacity ? Number(capacity) : null,
        amenities,
        image_ids: imageIds,
        is_active: isActive,
      };
      return room ? roomsApi.update(room.id, payload) : roomsApi.create(payload);
    },
    onSuccess: () => {
      showToast({ title: room ? "Room updated" : "Room created", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save room", description: errorMessage(err), variant: "error" }),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={room ? "Edit room" : "Add room"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!name}>
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
        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Capacity" type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <TagInput label="Amenities" value={amenities} onChange={setAmenities} placeholder="e.g. Air conditioning, Enter…" />
        <MultiImagePickerField label="Images" bucket="stay" imageIds={imageIds} onChange={setImageIds} />
        <Switch checked={isActive} onChange={setIsActive} label="Active" />
      </form>
    </Modal>
  );
}
