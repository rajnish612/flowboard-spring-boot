import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import {
  useNotificationSocket,
  type NotificationSocketData,
} from "../websocket/NotificationSocket";

const NotificationToast = () => {
  const { user } = useAuth();
  const [notification, setNotification] =
    useState<NotificationSocketData | null>(null);

  useNotificationSocket(setNotification, Boolean(user));

  useEffect(() => {
    if (!notification) return;

    const timeout = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timeout);
  }, [notification]);

  if (!notification) return null;

  const actorInitial =
    notification.actorName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="fixed right-4 top-4 z-100 w-[min(calc(100vw-2rem),28rem)] rounded-2xl border border-indigo-200 bg-white p-4 shadow-2xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {notification.actorAvatar ? (
          <img
            src={notification.actorAvatar}
            alt={notification.actorName ?? "User"}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
            aria-hidden="true"
          >
            {actorInitial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Bell
              className="shrink-0 text-indigo-600"
              size={16}
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-slate-900">
              {notification.title}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {notification.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNotification(null)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
