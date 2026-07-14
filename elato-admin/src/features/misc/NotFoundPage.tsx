import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-3xl font-semibold text-neutral-300">404</p>
      <p className="text-sm text-neutral-600">This page doesn't exist.</p>
      <Link to="/">
        <Button variant="outline" size="sm">
          Back to dashboard
        </Button>
      </Link>
    </div>
  );
}
