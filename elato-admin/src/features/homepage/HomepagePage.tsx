import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { siteContentApi } from "../../api/resources";
import { ErrorState, PageHeader } from "../../components/ui";
import { SectionImageCard } from "../shared/SectionImageCard";
import { InstagramSection } from "../instagram/InstagramSection";
import { ReviewsSection } from "../reviews/ReviewsSection";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/query-client";

const SERVICES_IMAGE_KEYS: { key: string; label: string }[] = [
  { key: "home_services_stay_image", label: "Stay" },
  { key: "home_services_celebre_image", label: "Celebré" },
  { key: "home_services_events_image", label: "Events" },
];

const ABOUT_IMAGE_KEY = "home_about_image";

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

  return (
    <div>
      <PageHeader title="Homepage" description="Services and About images, Instagram reels and reviews shown on the public homepage." />

      {isError ? (
        <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-skeleton rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Services</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {SERVICES_IMAGE_KEYS.map((config) => (
                <SectionImageCard
                  key={config.key}
                  label={config.label}
                  bucket="hero"
                  value={byKey.get(config.key)}
                  onSave={(image) => saveMutation.mutate({ key: config.key, value: image })}
                  isSaving={saveMutation.isPending && saveMutation.variables?.key === config.key}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">About</p>
            <SectionImageCard
              label="About section image"
              bucket="hero"
              value={byKey.get(ABOUT_IMAGE_KEY)}
              onSave={(image) => saveMutation.mutate({ key: ABOUT_IMAGE_KEY, value: image })}
              isSaving={saveMutation.isPending && saveMutation.variables?.key === ABOUT_IMAGE_KEY}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Instagram</p>
            <InstagramSection />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Reviews</p>
            <ReviewsSection />
          </div>
        </div>
      )}
    </div>
  );
}
