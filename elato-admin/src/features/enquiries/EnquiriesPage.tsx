import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Mail, Phone, Users, Calendar } from "lucide-react";
import { enquiriesApi } from "../../api/resources";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  Pagination,
  Select,
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
import { cn, formatDate, formatDateTime } from "../../lib/utils";
import { ENQUIRY_STATUSES, STATUS_LABEL, STATUS_TONE } from "./status";
import type { EnquiryOut, EnquiryStatus } from "../../types/api";

const LIMIT = 50;

export function EnquiriesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [detail, setDetail] = useState<EnquiryOut | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["enquiries", statusFilter, offset],
    queryFn: () => enquiriesApi.list({ status: statusFilter || undefined, limit: LIMIT, offset }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) => enquiriesApi.updateStatus(id, status),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDetail((prev) => (prev && prev.id === updated.id ? updated : prev));
    },
    onError: (err) => showToast({ title: "Couldn't update status", description: errorMessage(err), variant: "error" }),
  });

  return (
    <div>
      <PageHeader title="Enquiries" description="Submissions from the public site's enquiry forms." />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterTab label="All" active={statusFilter === ""} onClick={() => { setStatusFilter(""); setOffset(0); }} />
        {ENQUIRY_STATUSES.map((s) => (
          <FilterTab
            key={s}
            label={STATUS_LABEL[s]}
            active={statusFilter === s}
            onClick={() => {
              setStatusFilter(s);
              setOffset(0);
            }}
          />
        ))}
      </div>

      <Card>
        <CardHeader title={`${data?.total ?? "…"} enquiries`} />
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={Inbox} title="No enquiries yet" description="They'll show up here as visitors submit forms on the public site." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Source</Th>
                <Th>Contact</Th>
                <Th>Guests</Th>
                <Th>Preferred date</Th>
                <Th>Received</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((enquiry) => (
                <Tr key={enquiry.id} className="cursor-pointer" onClick={() => setDetail(enquiry)}>
                  <Td className="font-medium text-neutral-800">{enquiry.name}</Td>
                  <Td className="capitalize text-neutral-600">{enquiry.source_page}</Td>
                  <Td className="text-xs text-neutral-500">
                    <div>{enquiry.phone}</div>
                    {enquiry.email && <div className="truncate">{enquiry.email}</div>}
                  </Td>
                  <Td className="text-neutral-600">{enquiry.guests ?? "—"}</Td>
                  <Td className="text-xs text-neutral-500">{formatDate(enquiry.preferred_date)}</Td>
                  <Td className="text-xs text-neutral-400">{formatDateTime(enquiry.created_at)}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={enquiry.status}
                      onChange={(e) => statusMutation.mutate({ id: enquiry.id, status: e.target.value as EnquiryStatus })}
                      aria-label={`Status for ${enquiry.name}`}
                      className="h-8 py-1 text-xs"
                    >
                      {ENQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
        {data && <Pagination total={data.total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ""} size="sm">
        {detail && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <Badge tone={STATUS_TONE[detail.status]}>{STATUS_LABEL[detail.status]}</Badge>
              <span className="text-xs text-neutral-400">{formatDateTime(detail.created_at)}</span>
            </div>
            <DetailRow icon={Phone} label="Phone" value={detail.phone} />
            {detail.email && <DetailRow icon={Mail} label="Email" value={detail.email} />}
            {detail.guests != null && <DetailRow icon={Users} label="Guests" value={String(detail.guests)} />}
            {detail.preferred_date && <DetailRow icon={Calendar} label="Preferred date" value={formatDate(detail.preferred_date)} />}
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Source page</p>
              <p className="capitalize text-neutral-700">{detail.source_page}</p>
            </div>
            {detail.message && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Message</p>
                <p className="whitespace-pre-wrap text-neutral-700">{detail.message}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-700">
      <Icon className="h-3.5 w-3.5 text-neutral-400" />
      <span className="text-xs text-neutral-400">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200",
      )}
    >
      {label}
    </button>
  );
}
