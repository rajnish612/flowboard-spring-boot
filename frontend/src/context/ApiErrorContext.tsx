import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToApiErrors, type ApiError } from "../utils/apiErrors";

const ApiErrorToast = () => {
  const [error, setError] = useState<ApiError | null>(null);

  // Register the toast for the app lifetime and remove the listener on unmount.
  useEffect(() => {
    const unsubscribe = subscribeToApiErrors(setError);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!error) return;

    // Keep transient failures visible without requiring manual dismissal.
    const timeout = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(timeout);
  }, [error]);

  if (!error) return null;

  return (
    <div
      className="fixed right-4 top-4 z-100 w-[min(calc(100vw-2rem),28rem)] rounded-2xl border border-red-200 bg-white p-4 shadow-2xl"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Something went wrong</p>
          <p className="mt-1 text-sm text-slate-600">{error.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setError(null)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss error"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export const ApiErrorProvider = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <ApiErrorToast />
  </>
);
