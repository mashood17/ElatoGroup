import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { usersApi } from "../../api/resources";
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
  Select,
  Table,
  Tbody,
  Td,
  Th,
  TableSkeleton,
  Thead,
  Tr,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import { formatDate } from "../../lib/utils";
import type { AdminOut, AdminRole } from "../../types/api";

const ROLE_TONE: Record<AdminRole, "accent" | "info" | "neutral"> = { owner: "accent", admin: "info", editor: "neutral" };

export function UsersPage() {
  const { admin: currentAdmin, hasRole } = useAuth();
  const isOwner = hasRole("owner");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOut | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Admin removed", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't remove admin", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <PageHeader
        title="Users"
        description="Admin panel accounts. Owner-only: create, edit and delete."
        actions={
          isOwner && (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add admin
            </Button>
          )
        }
      />

      <Card>
        <CardHeader title={`${data?.length ?? "…"} admins`} />
        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No admins found" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Last login</Th>
                <Th>Created</Th>
                {isOwner && <Th className="text-right">Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((admin) => {
                const isSelf = admin.id === currentAdmin?.id;
                return (
                  <Tr key={admin.id}>
                    <Td className="font-medium text-neutral-800">
                      {admin.email} {isSelf && <span className="text-xs text-neutral-400">(you)</span>}
                    </Td>
                    <Td>
                      <Badge tone={ROLE_TONE[admin.role]}>{admin.role}</Badge>
                    </Td>
                    <Td className="text-xs text-neutral-500">{formatDate(admin.last_login_at)}</Td>
                    <Td className="text-xs text-neutral-500">{formatDate(admin.created_at)}</Td>
                    {isOwner && (
                      <Td className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${admin.email}`}
                          onClick={() => {
                            setEditing(admin);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${admin.email}`}
                          disabled={isSelf}
                          title={isSelf ? "You can't delete your own account" : undefined}
                          onClick={() => setDeleteTarget(admin)}
                        >
                          <Trash2 className={`h-3.5 w-3.5 ${isSelf ? "text-neutral-300" : "text-red-500"}`} />
                        </Button>
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      {isOwner && (
        <UserFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          admin={editing}
          onSaved={() => {
            setFormOpen(false);
            void invalidate();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.email}?`}
        description="They'll immediately lose access to the admin panel."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function UserFormModal({
  open,
  onClose,
  admin,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  admin: AdminOut | null;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");

  useEffect(() => {
    if (open) {
      setEmail(admin?.email ?? "");
      setPassword("");
      setRole(admin?.role ?? "editor");
    }
  }, [open, admin]);

  const mutation = useMutation({
    mutationFn: () => {
      if (admin) {
        const payload: { role?: AdminRole; password?: string } = { role };
        if (password) payload.password = password;
        return usersApi.update(admin.id, payload);
      }
      return usersApi.create({ email, password, role });
    },
    onSuccess: () => {
      showToast({ title: admin ? "Admin updated" : "Admin created", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save admin", description: errorMessage(err), variant: "error" }),
  });

  const canSubmit = admin ? true : !!email && password.length >= 8;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={admin ? "Edit admin" : "Add admin"}
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
          label="Email"
          type="email"
          required
          disabled={!!admin}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint={admin ? "Email can't be changed after creation." : undefined}
        />
        <Input
          label={admin ? "New password" : "Password"}
          type="password"
          required={!admin}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={admin ? "Leave blank to keep the current password." : "At least 8 characters."}
        />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </Select>
      </form>
    </Modal>
  );
}
