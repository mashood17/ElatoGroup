import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { categoriesApi, menuItemsApi } from "../../api/resources";
import {
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
  Select,
  Switch,
  TableSkeleton,
  Textarea,
} from "../../components/ui";
import { SortableList } from "../../components/ui/SortableList";
import { ImagePickerField } from "../media/ImagePickerField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatCurrency } from "../../lib/utils";
import type { MenuItemOut } from "../../types/api";

const LIMIT = 50;

export function MenuPage() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(0), [categoryFilter]);

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => categoriesApi.list({ limit: 100 }) });
  const queryKey = ["menu-items", categoryFilter, offset];
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => menuItemsApi.list({ category_id: categoryFilter || undefined, limit: LIMIT, offset }),
  });

  const [orderedItems, setOrderedItems] = useState<MenuItemOut[]>([]);
  useEffect(() => {
    if (data) setOrderedItems([...data.items].sort((a, b) => a.display_order - b.display_order));
  }, [data]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItemOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItemOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["menu-items"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuItemsApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Menu item deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete item", description: errorMessage(err), variant: "error" }),
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      menuItemsApi.update(id, { is_available }),
    onSuccess: () => void invalidate(),
    onError: (err) => showToast({ title: "Couldn't update availability", description: errorMessage(err), variant: "error" }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: MenuItemOut[]) => {
      const changed = items.map((item, index) => ({ item, index })).filter(({ item, index }) => item.display_order !== index);
      await Promise.all(changed.map(({ item, index }) => menuItemsApi.update(item.id, { display_order: index })));
    },
    onSuccess: () => void invalidate(),
    onError: (err) => {
      showToast({ title: "Couldn't save new order", description: errorMessage(err), variant: "error" });
      void invalidate();
    },
  });

  const categoryName = (id: string) => categoriesQuery.data?.items.find((c) => c.id === id)?.name ?? "—";
  const canReorder = !!categoryFilter;

  return (
    <div>
      <PageHeader
        title="Menu"
        description="Items shown on the public menu."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={`${data?.total ?? "…"} items`}
          description={canReorder ? "Drag to reorder within this category." : "Filter by a category to reorder items."}
          actions={
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categoriesQuery.data?.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          }
        />
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : orderedItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No menu items yet"
            description="Add your first dish to get the menu started."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add item
              </Button>
            }
          />
        ) : canReorder ? (
          <SortableList
            items={orderedItems}
            getId={(i) => i.id}
            onReorder={(next) => {
              setOrderedItems(next);
              reorderMutation.mutate(next);
            }}
            className="divide-y divide-neutral-100 px-2 py-1"
            renderItem={(item) => (
              <MenuItemRow
                item={item}
                categoryName={categoryName(item.category_id)}
                canDelete={canDelete}
                onEdit={() => {
                  setEditing(item);
                  setFormOpen(true);
                }}
                onDelete={() => setDeleteTarget(item)}
                onToggleAvailable={(v) => availabilityMutation.mutate({ id: item.id, is_available: v })}
              />
            )}
          />
        ) : (
          <div className="divide-y divide-neutral-100">
            {orderedItems.map((item) => (
              <div key={item.id} className="px-3">
                <MenuItemRow
                  item={item}
                  categoryName={categoryName(item.category_id)}
                  canDelete={canDelete}
                  onEdit={() => {
                    setEditing(item);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleteTarget(item)}
                  onToggleAvailable={(v) => availabilityMutation.mutate({ id: item.id, is_available: v })}
                />
              </div>
            ))}
          </div>
        )}
        {data && <Pagination total={data.total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />}
      </Card>

      <MenuItemFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
        categories={categoriesQuery.data?.items ?? []}
        defaultCategoryId={categoryFilter || undefined}
        nextDisplayOrder={orderedItems.length}
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

function MenuItemRow({
  item,
  categoryName,
  canDelete,
  onEdit,
  onDelete,
  onToggleAvailable,
}: {
  item: MenuItemOut;
  categoryName: string;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailable: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-800">{item.name}</p>
        <p className="truncate text-xs text-neutral-400">
          {categoryName} · {formatCurrency(item.price)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Switch checked={item.is_available} onChange={onToggleAvailable} label="Available" />
        <Button variant="ghost" size="icon" aria-label={`Edit ${item.name}`} onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon" aria-label={`Delete ${item.name}`} onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}

function MenuItemFormModal({
  open,
  onClose,
  item,
  categories,
  defaultCategoryId,
  nextDisplayOrder,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  item: MenuItemOut | null;
  categories: { id: string; name: string }[];
  defaultCategoryId?: string;
  nextDisplayOrder: number;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageId, setImageId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (open) {
      setCategoryId(item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "");
      setName(item?.name ?? "");
      setDescription(item?.description ?? "");
      setPrice(item?.price != null ? String(item.price) : "");
      setImageId(item?.image_id ?? null);
      setIsAvailable(item?.is_available ?? true);
    }
  }, [open, item, defaultCategoryId, categories]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        category_id: categoryId,
        name,
        description: description || null,
        price: price ? Number(price) : null,
        image_id: imageId,
        is_available: isAvailable,
      };
      return item
        ? menuItemsApi.update(item.id, payload)
        : menuItemsApi.create({ ...payload, display_order: nextDisplayOrder });
    },
    onSuccess: () => {
      showToast({ title: item ? "Item updated" : "Item created", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save item", description: errorMessage(err), variant: "error" }),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "Edit menu item" : "Add menu item"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!name || !categoryId}>
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
        <Select label="Category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.length === 0 && <option value="">No categories yet — add one first</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label="Price (INR)"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <ImagePickerField label="Image" bucket="menu-images" imageId={imageId} onChange={setImageId} />
        <Switch checked={isAvailable} onChange={setIsAvailable} label="Available on the menu" />
      </form>
    </Modal>
  );
}
