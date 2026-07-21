import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Gift, Power, PowerOff } from "lucide-react";
import { offersApi } from "../../api/resources";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  Switch,
  Table,
  Tbody,
  Td,
  TableSkeleton,
  Textarea,
  Th,
  Thead,
  Tr,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import type { OfferOut } from "../../types/api";

const QUERY_KEY = ["offers"];

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function OffersPage() {
  const { hasRole } = useAuth();
  const canDelete = hasRole("owner", "admin");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: offersApi.list,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OfferOut | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferOut | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offersApi.remove(id),
    onSuccess: () => {
      showToast({ title: "Offer deleted", variant: "success" });
      setDeleteTarget(null);
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't delete offer", description: errorMessage(err), variant: "error" }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => offersApi.activate(id),
    onMutate: (id) => setPendingToggleId(id),
    onSuccess: () => {
      showToast({ title: "Offer activated — this is now the scratch card's live offer", variant: "success" });
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't activate offer", description: errorMessage(err), variant: "error" }),
    onSettled: () => setPendingToggleId(null),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => offersApi.deactivate(id),
    onMutate: (id) => setPendingToggleId(id),
    onSuccess: () => {
      showToast({ title: "Offer deactivated", variant: "success" });
      void invalidate();
    },
    onError: (err) => showToast({ title: "Couldn't deactivate offer", description: errorMessage(err), variant: "error" }),
    onSettled: () => setPendingToggleId(null),
  });

  const offers = data ?? [];

  return (
    <div>
      <PageHeader
        title="Offers"
        description="The scratch-card reward shown on the public site. Only one offer can be active at a time."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Create offer
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : offers.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No offers yet"
            description="Create an offer and activate it to power the scratch-card popup."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create offer
              </Button>
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Offer</Th>
                <Th>Reward</Th>
                <Th>Validity</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {offers.map((offer) => (
                <Tr key={offer.id}>
                  <Td>
                    <p className="font-medium text-neutral-900">{offer.name}</p>
                    {offer.description && <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-400">{offer.description}</p>}
                  </Td>
                  <Td>{offer.reward_text}</Td>
                  <Td className="whitespace-nowrap text-xs">
                    {offer.valid_from || offer.valid_to
                      ? `${formatDate(offer.valid_from)} – ${formatDate(offer.valid_to)}`
                      : "Always valid"}
                  </Td>
                  <Td>
                    <Badge tone={offer.is_active ? "success" : "neutral"}>{offer.is_active ? "Active" : "Inactive"}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      {offer.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={pendingToggleId === offer.id && deactivateMutation.isPending}
                          onClick={() => deactivateMutation.mutate(offer.id)}
                        >
                          <PowerOff className="h-3.5 w-3.5" /> Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={pendingToggleId === offer.id && activateMutation.isPending}
                          onClick={() => activateMutation.mutate(offer.id)}
                        >
                          <Power className="h-3.5 w-3.5" /> Activate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${offer.name}`}
                        onClick={() => {
                          setEditing(offer);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${offer.name}`}
                          onClick={() => setDeleteTarget(offer)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <OfferFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        offer={editing}
        onSaved={() => {
          setFormOpen(false);
          void invalidate();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Past registrations for this offer are kept (with the offer name preserved) — only the offer itself is removed."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function OfferFormModal({
  open,
  onClose,
  offer,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  offer: OfferOut | null;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rewardText, setRewardText] = useState("");
  const [scratchRevealText, setScratchRevealText] = useState("");
  const [popupHeading, setPopupHeading] = useState("An Exclusive Gift Awaits");
  const [buttonText, setButtonText] = useState("Avail Offer");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [activateNow, setActivateNow] = useState(false);

  useEffect(() => {
    if (open) {
      setName(offer?.name ?? "");
      setDescription(offer?.description ?? "");
      setRewardText(offer?.reward_text ?? "");
      setScratchRevealText(offer?.scratch_reveal_text ?? "");
      setPopupHeading(offer?.popup_heading ?? "An Exclusive Gift Awaits");
      setButtonText(offer?.button_text ?? "Avail Offer");
      setValidFrom(offer?.valid_from ?? "");
      setValidTo(offer?.valid_to ?? "");
      setActivateNow(offer?.is_active ?? false);
    }
  }, [open, offer]);

  const mutation = useMutation({
    mutationFn: () => {
      const fields = {
        name,
        description: description || null,
        reward_text: rewardText,
        scratch_reveal_text: scratchRevealText || null,
        popup_heading: popupHeading,
        button_text: buttonText,
        valid_from: validFrom || null,
        valid_to: validTo || null,
        is_active: activateNow,
      };
      return offer ? offersApi.update(offer.id, fields) : offersApi.create(fields);
    },
    onSuccess: () => {
      showToast({ title: offer ? "Offer updated" : "Offer created", variant: "success" });
      onSaved();
    },
    onError: (err) => showToast({ title: "Couldn't save offer", description: errorMessage(err), variant: "error" }),
  });

  const canSave = !!name && !!rewardText;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={offer ? "Edit offer" : "Create offer"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" isLoading={mutation.isPending} disabled={!canSave} onClick={() => mutation.mutate()}>
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
        <Input label="Offer name" required value={name} onChange={(e) => setName(e.target.value)} hint="Internal label — shown in the admin only." />
        <Textarea label="Offer description" value={description} onChange={(e) => setDescription(e.target.value)} hint="Internal note about this offer." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Reward text"
            required
            value={rewardText}
            onChange={(e) => setRewardText(e.target.value)}
            placeholder="20% OFF"
            hint="What the scratch card reveals, e.g. “20% OFF” or “Free Scoop”."
          />
          <Input
            label="Scratch reveal text"
            value={scratchRevealText}
            onChange={(e) => setScratchRevealText(e.target.value)}
            placeholder="You've won!"
            hint="Short line shown alongside the reward once revealed."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Popup heading" value={popupHeading} onChange={(e) => setPopupHeading(e.target.value)} placeholder="An Exclusive Gift Awaits" />
          <Input label="Button text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Avail Offer" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Valid from" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} hint="Optional — leave blank for no start date." />
          <Input label="Valid to" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} hint="Optional — leave blank for no end date." />
        </div>
        <Switch
          checked={activateNow}
          onChange={setActivateNow}
          label="Set as the active offer (deactivates whichever offer is currently active)"
        />
      </form>
    </Modal>
  );
}
