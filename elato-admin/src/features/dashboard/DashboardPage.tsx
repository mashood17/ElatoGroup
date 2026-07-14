import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Inbox, UtensilsCrossed, Images, Star, ArrowUpRight } from "lucide-react";
import { dashboardApi } from "../../api/resources";
import { Badge, Card, CardBody, CardHeader, ErrorState, PageHeader, StatCardSkeleton } from "../../components/ui";
import { formatDateTime } from "../../lib/utils";
import { errorMessage } from "../../lib/query-client";
import { STATUS_TONE } from "../enquiries/status";

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.stats,
  });

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of ELATŌ's site activity." />

      {isError ? (
        <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={Inbox}
                  label="New enquiries"
                  value={data.new_enquiries}
                  sub={`${data.total_enquiries} total`}
                  to="/enquiries"
                />
                <StatCard icon={UtensilsCrossed} label="Menu items" value={data.total_menu_items} to="/menu" />
                <StatCard icon={Images} label="Gallery items" value={data.total_gallery_items} to="/gallery" />
                <StatCard icon={Star} label="Reviews" value={data.total_reviews} to="/reviews" />
              </>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader
                title="Recent enquiries"
                description="Latest submissions from the public site"
                actions={
                  <Link to="/enquiries" className="flex items-center gap-1 text-xs font-medium text-accent-700 hover:text-accent-800">
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Link>
                }
              />
              <CardBody className="!p-0">
                {isLoading || !data ? (
                  <div className="p-5 text-xs text-neutral-400">Loading…</div>
                ) : data.recent_enquiries.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs text-neutral-400">No enquiries yet.</div>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {data.recent_enquiries.map((enquiry) => (
                      <li key={enquiry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-800">{enquiry.name}</p>
                          <p className="truncate text-xs text-neutral-500">
                            {enquiry.source_page} · {formatDateTime(enquiry.created_at)}
                          </p>
                        </div>
                        <Badge tone={STATUS_TONE[enquiry.status]}>{enquiry.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Activity, last 30 days" description="Analytics events by name" />
              <CardBody>
                {isLoading || !data ? (
                  <div className="text-xs text-neutral-400">Loading…</div>
                ) : (
                  <AnalyticsMiniBars counts={data.analytics_last_30_days} />
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  to,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  sub?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-neutral-200 bg-white p-5 transition-colors hover:border-accent-300 hover:bg-accent-50/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <Icon className="h-4 w-4 text-neutral-300 group-hover:text-accent-500" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-400">{sub}</p>}
    </Link>
  );
}

export function AnalyticsMiniBars({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return <p className="text-xs text-neutral-400">No analytics events recorded in this window.</p>;
  }
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <ul className="flex flex-col gap-2.5">
      {entries.map(([name, count]) => (
        <li key={name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-700">{name}</span>
            <span className="text-neutral-400">{count}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-100">
            <div
              className="h-1.5 rounded-full bg-accent-500"
              style={{ width: `${max === 0 ? 0 : Math.max(4, (count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
