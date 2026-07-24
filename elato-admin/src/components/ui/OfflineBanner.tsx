import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Fixed strip announcing a lost connection — the admin panel's mutations
 * (save/delete/upload) all fail loudly via ToastContext already, but a
 * standing "you're offline" cue means that failure isn't the first signal
 * something's wrong. Sits above the Sidebar's mobile header and any Modal.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900 shadow-elevation-sm"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      You're offline — changes won't save until your connection is back.
    </div>
  );
}
