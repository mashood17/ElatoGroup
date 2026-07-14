import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { siteContentApi } from "../../api/resources";
import { ErrorState, PageHeader } from "../../components/ui";
import { KeyValueCard } from "../shared/KeyValueCard";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";

/**
 * Expected keys per the task brief. Shapes below are best-guess defaults —
 * the backend stores freeform jsonb, so these are just sensible starting
 * points; the "Raw JSON" toggle on each card covers anything that doesn't
 * fit this guess.
 */
const EXPECTED_KEYS: { key: string; label: string; description: string; defaultValue: Record<string, unknown> }[] = [
  {
    key: "hero",
    label: "Hero",
    description: "The homepage's top banner.",
    defaultValue: { heading: "", subheading: "", cta_label: "", cta_link: "" },
  },
  {
    key: "about",
    label: "About",
    description: "The homepage 'about ELATŌ' section.",
    defaultValue: { heading: "", body: "" },
  },
  {
    key: "vision",
    label: "Vision",
    description: "Vision statement.",
    defaultValue: { heading: "", body: "" },
  },
  {
    key: "mission",
    label: "Mission",
    description: "Mission statement.",
    defaultValue: { heading: "", body: "" },
  },
  {
    key: "values",
    label: "Values",
    description: "Core values list.",
    defaultValue: { heading: "", items: ["", "", ""] },
  },
  {
    key: "contact",
    label: "Contact",
    description: "Address, phone, email and map link shown on the site.",
    defaultValue: { address: "", phone: "", email: "", map_link: "" },
  },
];

export function HomepagePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["site-content"],
    queryFn: siteContentApi.list,
  });

  const saveMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => siteContentApi.upsert(key, value),
    onSuccess: () => {
      showToast({ title: "Saved", variant: "success" });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (err) => showToast({ title: "Couldn't save", description: errorMessage(err), variant: "error" }),
  });

  const byKey = new Map((data ?? []).map((c) => [c.key, c.value]));
  const extraKeys = (data ?? []).filter((c) => !EXPECTED_KEYS.some((e) => e.key === c.key));

  return (
    <div>
      <PageHeader title="Homepage" description="Content shown on the public homepage — hero, about, vision, mission, values and contact." />

      {isError ? (
        <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-skeleton rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {EXPECTED_KEYS.map((config) => (
            <KeyValueCard
              key={config.key}
              keyName={config.key}
              label={config.label}
              description={config.description}
              value={byKey.get(config.key)}
              defaultValue={config.defaultValue}
              onSave={(key, value) => saveMutation.mutate({ key, value })}
              isSaving={saveMutation.isPending && saveMutation.variables?.key === config.key}
            />
          ))}

          {extraKeys.length > 0 && (
            <>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Other content keys</p>
              {extraKeys.map((entry) => (
                <KeyValueCard
                  key={entry.key}
                  keyName={entry.key}
                  label={entry.key}
                  value={entry.value}
                  defaultValue={{}}
                  onSave={(key, value) => saveMutation.mutate({ key, value })}
                  isSaving={saveMutation.isPending && saveMutation.variables?.key === entry.key}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
