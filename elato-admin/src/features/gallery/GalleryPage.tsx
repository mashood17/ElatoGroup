import { PageHeader } from "../../components/ui";
import { GalleryPanel } from "../shared/GalleryPanel";

export function GalleryPage() {
  return (
    <div>
      <PageHeader title="Gallery" description="Category-tagged photos shown on the public site. Drag to reorder." />
      <GalleryPanel title="All photos" />
    </div>
  );
}
