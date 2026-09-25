import { Bell, Check, CheckCheck,X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/UseAuth";
import { axiosIns } from "../utils/axiosInstance";
import {
  useNotificationSocket,
  type NotificationSocketData,
} from "../websocket/NotificationSocket";

const NOTIFICATIONS_BASE = "/api/notifications";

const NotificationToast = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notification, setNotification] =
    useState<NotificationSocketData | null>(null);
  const [notifications, setNotifications] = useState<NotificationSocketData[]>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDashboard = pathname.startsWith("/dashboard");
  const visibleNotifications = notifications;
  const unreadCount = visibleNotifications.filter((item) => !item.read).length;

  // Keep the history list and toast synchronized when a notification arrives through WebSocket.
  const handleNotification = (incoming: NotificationSocketData) => {
    setNotifications((current) => [
      incoming,
      ...current.filter((item) => item.id !== incoming.id),
    ]);
    setNotification(incoming);
  };

  useNotificationSocket(handleNotification, Boolean(user));

  // Refresh notification history when the menu opens or the authenticated user changes.
  useEffect(() => {
    if (!user) return;

    axiosIns
      .get<NotificationSocketData[]>(NOTIFICATIONS_BASE)
      .then((response) => {
        setNotifications((current) => {
          const fetched = response.data;
          const fetchedIds = new Set(fetched.map((item) => item.id));
          const liveItems = current.filter((item) => !fetchedIds.has(item.id));
          return [...liveItems, ...fetched];
        });
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [open, user]);

  useEffect(() => {
    if (!notification) return;

    const timeout = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timeout);
  }, [notification]);

  // Mark one notification as read before optionally navigating to its board.
  const markAsRead = async (item: NotificationSocketData) => {
    if (item.read) return;

    await axiosIns.patch(`${NOTIFICATIONS_BASE}/${item.id}/read`);
    setNotifications((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, read: true } : entry,
      ),
    );
  };

  // The backend marks all of the user's notifications as read in one request.
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    await axiosIns.patch(`${NOTIFICATIONS_BASE}/read-all`);
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  };

  // Open the related board after marking the selected notification as read.
  const openNotification = async (item: NotificationSocketData) => {
    await markAsRead(item);

    if (item.boardId !== null) {
      setOpen(false);
      setNotification(null);
      navigate(`/board/${item.boardId}`);
    }
  };

  const toggleNotifications = () => {
    if (!open) {
      setLoading(true);
    }
    setOpen((current) => !current);
  };

  if (!user) return null;

  const actorInitial =
    notification?.actorName?.trim().charAt(0).toUpperCase() || "?";
  const isBoard = pathname.startsWith("/board/");

  return (
    <>
      <div className="ml-auto flex items-start gap-2">
        {!isBoard && (
          <div className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 aria-expanded:bg-indigo-50 aria-expanded:text-indigo-600"
              aria-label="Open notifications"
              aria-expanded={open}
            >
              <Bell size={20} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-12 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {unreadCount ? `${unreadCount} unread` : "All caught up"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      aria-label="Mark all notifications as read"
                    >
                      <CheckCheck size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      aria-label="Close notifications"
                    >
                      <X size={17} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-12 text-center text-sm text-slate-400">
                      Loading notifications...
                    </div>
                  ) : visibleNotifications.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    visibleNotifications.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => openNotification(item)}
                        className={`flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                          item.read
                            ? "bg-white hover:bg-slate-50"
                            : "bg-indigo-50/50 hover:bg-indigo-50"
                        }`}
                      >
                        {item.actorAvatar ? (
                          <img
                            src={item.actorAvatar}
                            alt={item.actorName ?? "User"}
                            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm shadow-slate-900/10"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 ring-2 ring-white shadow-sm shadow-slate-900/10">
                            {item.actorName?.charAt(0).toUpperCase() ?? "?"}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-slate-900">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-[13px] leading-5 text-slate-600">
                            {item.message}
                          </span>
                          <span className="mt-1 block text-[11px] tabular-nums text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </span>
                        {!item.read && (
                          <Check
                            className="mt-1 shrink-0 text-indigo-600"
                            size={16}
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {notification && (
        <div
          className="fixed right-4 top-4 z-100 w-[min(calc(100vw-2rem),28rem)] cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15 ring-4 ring-indigo-500/5"
          role="status"
          aria-live="polite"
          onClick={() => openNotification(notification)}
        >
          <div className="flex items-start gap-3">
            {notification.actorAvatar ? (
              <img
                src={notification.actorAvatar}
                alt={notification.actorName ?? "User"}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm shadow-slate-900/10"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white ring-2 ring-white shadow-sm shadow-indigo-500/25">
                {actorInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {notification.title}
              </p>
              <p className="mt-0.5 text-sm leading-5 text-slate-600">
                {notification.message}
              </p>
              {isDashboard && (
                <div className="mt-2.5 space-y-1 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-500 ring-1 ring-inset ring-slate-200/70">
                  {notification.actorName && (
                    <p>
                      <span className="font-medium text-slate-700">User:</span>{" "}
                      {notification.actorName}
                    </p>
                  )}
                  {notification.workspaceName && (
                    <p>
                      <span className="font-medium text-slate-700">
                        Workspace:
                      </span>{" "}
                      {notification.workspaceName}
                    </p>
                  )}
                  {notification.boardName && (
                    <p>
                      <span className="font-medium text-slate-700">Board:</span>{" "}
                      {notification.boardName}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setNotification(null);
              }}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              aria-label="Dismiss notification"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationToast;
