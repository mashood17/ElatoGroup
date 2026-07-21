import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Search } from "lucide-react";
import { offerRegistrationsApi, offersApi, usersApi } from "../../api/resources";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  Table,
  Tbody,
  Td,
  TableSkeleton,
  Textarea,
  Th,
  Thead,
  Tr,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";
import type { OfferRegistrationOut } from "../../types/api";

const LIMIT = 20;

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function OfferRegistrationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [q, setQ] = useState("");
  const [offerId, setOfferId] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [redeemTarget, setRedeemTarget] = useState<OfferRegistrationOut | null>(null);

  const searchParams = {
    q: q || undefined,
    offer_id: offerId || undefined,
    country_code: countryCode || undefined,
    status: status || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
    limit: LIMIT,
    offset,
  };

  const QUERY_KEY = ["offer-registrations", searchParams];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => offerRegistrationsApi.search(searchParams),
  });

  const { data: offers } = useQuery({ queryKey: ["offers"], queryFn: offersApi.list });
  const { data: admins } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });
  const adminEmailById = new Map((admins ?? []).map((a) => [a.id, a.email]));
  const offerNameById = new Map((offers ?? []).map((o) => [o.id, o.name]));

  const redeemMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      offerRegistrationsApi.redeem(id, { notes: notes || null }),
    onSuccess: () => {
      showToast({ title: "Marked as redeemed", variant: "success" });
      setRedeemTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["offer-registrations"] });
    },
    onError: (err) => showToast({ title: "Couldn't mark as redeemed", description: errorMessage(err), variant: "error" }),
  });

  function resetFilters() {
    setQ("");
    setOfferId("");
    setCountryCode("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  }

  const rows = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Offer Registrations"
        description="Search for a guest by name or phone to check their offer status, or find one to redeem at the counter."
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search"
            placeholder="Name or phone number"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOffset(0);
            }}
          />
          <Select
            label="Offer"
            value={offerId}
            onChange={(e) => {
              setOfferId(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">All offers</option>
            {(offers ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <Input
            label="Country code"
            placeholder="+91"
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setOffset(0);
            }}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="redeemed">Redeemed</option>
          </Select>
          <Input
            label="From date"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setOffset(0);
            }}
          />
          <Input
            label="To date"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setOffset(0);
            }}
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={q || offerId || countryCode || status || dateFrom || dateTo ? Search : ClipboardList}
            title="No registrations found"
            description="Try adjusting the filters above, or wait for the first scratch-card claim to come in."
          />
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Phone</Th>
                  <Th>Offer</Th>
                  <Th>Registered</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => (
                  <Tr key={r.id}>
                    <Td className="font-medium text-neutral-900">{r.name}</Td>
                    <Td className="whitespace-nowrap">
                      {r.country_code} {r.phone_number}
                    </Td>
                    <Td>{r.offer_id ? (offerNameById.get(r.offer_id) ?? r.offer_name) : r.offer_name}</Td>
                    <Td className="whitespace-nowrap text-xs">{formatDateTime(r.created_at)}</Td>
                    <Td>
                      {r.status === "redeemed" ? (
                        <div>
                          <Badge tone="success">Redeemed</Badge>
                          <p className="mt-1 text-[11px] text-neutral-400">
                            {formatDateTime(r.redeemed_at)}
                            {r.redeemed_by && adminEmailById.get(r.redeemed_by) ? ` · ${adminEmailById.get(r.redeemed_by)}` : ""}
                          </p>
                        </div>
                      ) : (
                        <Badge tone="warning">Pending</Badge>
                      )}
                    </Td>
                    <Td>
                      <div className="flex justify-end">
                        {r.status === "pending" ? (
                          <Button variant="outline" size="sm" onClick={() => setRedeemTarget(r)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Redeemed
                          </Button>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination total={data?.total ?? 0} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />
          </>
        )}
      </Card>

      <RedeemModal
        registration={redeemTarget}
        isLoading={redeemMutation.isPending}
        onCancel={() => setRedeemTarget(null)}
        onConfirm={(notes) => redeemTarget && redeemMutation.mutate({ id: redeemTarget.id, notes })}
      />
    </div>
  );
}

function RedeemModal({
  registration,
  isLoading,
  onCancel,
  onConfirm,
}: {
  registration: OfferRegistrationOut | null;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: (notes: string) => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Modal
      open={!!registration}
      onClose={onCancel}
      title="Mark as redeemed"
      description={registration ? `${registration.name} — ${registration.country_code} ${registration.phone_number} — ${registration.offer_name}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            isLoading={isLoading}
            onClick={() => {
              onConfirm(notes);
              setNotes("");
            }}
          >
            Confirm redemption
          </Button>
        </>
      }
    >
      <Textarea
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. redeemed at the counter, served by Priya"
        rows={3}
      />
    </Modal>
  );
}
