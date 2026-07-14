import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../api/resources";
import { Card, CardBody, CardHeader, ErrorState, PageHeader } from "../../components/ui";
import { errorMessage } from "../../lib/query-client";

export function AnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.stats,
  });

  const entries = data ? Object.entries(data.analytics_last_30_days).sort((a, b) => b[1] - a[1]) : [];
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const max = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Event counts captured via the public site's analytics beacon, last 30 days."
      />

      {isError ? (
        <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <Card>
          <CardHeader
            title="Events by name"
            description={data ? `${total.toLocaleString()} events across ${entries.length} event types` : undefined}
          />
          <CardBody>
            {isLoading || !data ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 animate-skeleton rounded bg-neutral-100" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-400">
                No analytics events recorded yet. They'll appear here once the public site starts sending them.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <th className="py-2 font-medium">Event</th>
                    <th className="py-2 font-medium">Volume</th>
                    <th className="py-2 text-right font-medium">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {entries.map(([name, count]) => (
                    <tr key={name}>
                      <td className="py-3 pr-4 font-medium text-neutral-800">{name}</td>
                      <td className="w-1/2 py-3 pr-4">
                        <div className="h-2 w-full rounded-full bg-neutral-100">
                          <div
                            className="h-2 rounded-full bg-accent-500"
                            style={{ width: `${max === 0 ? 0 : Math.max(3, (count / max) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 text-right tabular-nums text-neutral-600">{count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
