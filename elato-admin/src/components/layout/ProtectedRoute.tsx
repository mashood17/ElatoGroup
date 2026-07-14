import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import type { AdminRole } from "../../types/api";

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: AdminRole[] }) {
  const { status, admin, hasRole } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(...roles)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-neutral-800">You don't have access to this page.</p>
        <p className="text-xs text-neutral-500">
          Signed in as {admin?.email} ({admin?.role}). This section requires owner or admin access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
