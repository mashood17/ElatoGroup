import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { categoriesApi } from "../../api/resources";
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
  Switch,
  TableSkeleton,
  Textarea,
} from "../../components/ui";
import { SortableList } from "../../components/ui/SortableList";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { slugify } from "../../lib/utils";
import type { CategoryOut } from "../../types/api";

const QUERY_KEY = ["categories"];

export function CategoriesPage() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => categoriesApi.list({ limit: 100, offset: 0 }),
  });

  const [orderedItems, setOrderedItems] = useState<CategoryOut[]>([]);
  useEffect(() => {
    if (data) setOrderedItems([...data.items].sort((a, b) => a.display_order - b.display_order));
  }, [data]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Category deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete category", description: errorMessage(err), variant: "error" }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: CategoryOut[]) => {
      const changed = items
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) => item.display_order !== index);
      await Promise.all(changed.map(({ item, index }) => categoriesApi.update(item.id, { display_order: index })));
    },
    onError: (err) => {
      showToast({ title: "Couldn't save new order", description: errorMessage(err), variant: "error" });
      void invalidate();
    },
    onSuccess: () => void invalidate(),
  });

  function handleReorder(next: CategoryOut[]) {
    setOrderedItems(next);
    reorderMutation.mutate(next);
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Menu categories shown on the public site. Drag to reorder."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add category
          </Button>
        }
      />

      <Card>
        <CardHeader title={`${data?.total ?? "…"} categories`} />
        {isLoading ? (
          <TableSkeleton rows={5} cols={3} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : orderedItems.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Categories organize your menu items — add the first one to get started."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add category
              </Button>
            }
          />
        ) : (
          <SortableList
            items={orderedItems}
            getId={(c) => c.id}
            onReorder={handleReorder}
            className="divide-y divide-neutral-100 px-2 py-1"
            renderItem={(category) => (
              <div className="flex flex-1 items-center justify-between gap-3 py-2.5 pr-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-800">{category.name}</p>
                  <p className="truncate text-xs text-neutral-400">
                    /{category.slug}
                    {category.description ? ` — ${category.description}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={category.is_active ? "success" : "neutral"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => {
                      setEditing(category);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </Card>

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
        nextDisplayOrder={orderedItems.length}
        onSaved={() => {
          setFormOpen(false);
          void invalidate();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Menu items in this category will keep their category reference — reassign them first if needed."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function CategoryFormModal({
  open,
  onClose,
  category,
  nextDisplayOrder,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  category: CategoryOut | null;
  nextDisplayOrder: number;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setSlug(category?.slug ?? "");
      setSlugTouched(!!category);
      setDescription(category?.description ?? "");
      setIsActive(category?.is_active ?? true);
    }
  }, [open, category]);

  const mutation = useMutation({
    mutationFn: () =>
      category
        ? categoriesApi.update(category.id, { name, slug, description: description || null, is_active: isActive })
        : categoriesApi.create({
            name,
            slug,
            description: description || null,
            is_active: isActive,
            display_order: nextDisplayOrder,
          }),
    onSuccess: () => {
      showToast({ title: category ? "Category updated" : "Category created", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save category", description: errorMessage(err), variant: "error" }),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Edit category" : "Add category"}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!name || !slug}>
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
          label="Name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
        <Input
          label="Slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugTouched(true);
          }}
          hint="Lowercase letters, numbers and hyphens only."
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          hint="Shown under the category name on the public menu."
        />
        <Switch checked={isActive} onChange={setIsActive} label="Active (visible on the public site)" />
      </form>
    </Modal>
  );
}
