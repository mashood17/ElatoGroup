import { useQuery } from "@tanstack/react-query";
import { heroBackgroundsApi } from "../../api/resources";
import { ErrorState } from "../../components/ui";
import { errorMessage } from "../../lib/query-client";
import { HERO_BACKGROUNDS_QUERY_KEY } from "./hero-background-query-key";
import { HeroVideoCard } from "./HeroVideoCard";
import type { HeroSlot } from "../../types/api";

export function HeroBackgroundSection() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: HERO_BACKGROUNDS_QUERY_KEY,
    queryFn: heroBackgroundsApi.list,
  });

  if (isError) {
    return <ErrorState description={errorMessage(error)} onRetry={() => void refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 animate-skeleton rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  }

  const bySlot = new Map((data ?? []).map((row) => [row.slot, row] as const));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <HeroVideoCard
        slot={"desktop" as HeroSlot}
        label="Desktop Hero Video"
        description="Landscape clip shown at the md breakpoint and up (≥768px)."
        data={bySlot.get("desktop")}
      />
      <HeroVideoCard
        slot={"mobile" as HeroSlot}
        label="Mobile Hero Video"
        description="Portrait or square clip shown below the md breakpoint."
        data={bySlot.get("mobile")}
      />
    </div>
  );
}
