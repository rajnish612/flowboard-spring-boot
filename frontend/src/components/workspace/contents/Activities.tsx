import React, { useEffect, useState } from "react";
import {
  Clock3,
  Plus,
  MoveRight,
  UserPlus,
  UserMinus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useParams } from "react-router";
import { axiosIns } from "../../../utils/axiosInstance";

type Activity = {
  id: number;

  userId: number;
  userName: string;
  userAvatar?: string;

  action:
    | "CREATED"
    | "MOVED"
    | "ASSIGNED"
    | "UNASSIGNED"
    | "UPDATED"
    | "DELETED";
  message: string;

  assignedToName?: string;
  assignedToAvatar?: string;

  boardName: string;

  createdAt: string;

  type:
    | "CARD_CREATED"
    | "CARD_UPDATED"
    | "CARD_MOVED"
    | "CARD_DELETED"
    | "CARD_ASSIGNED"
    | "CARD_UNASSIGNED"
    | "LIST_CREATED"
    | "LIST_UPDATED"
    | "LIST_MOVED"
    | "LIST_DELETED";
};

const ActivityIcon = ({ action }: { action: Activity["action"] }) => {
  switch (action) {
    case "CREATED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
          <Plus size={17} />
        </div>
      );

    case "MOVED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100">
          <MoveRight size={17} />
        </div>
      );

    case "ASSIGNED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
          <UserPlus size={17} />
        </div>
      );

    case "UNASSIGNED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-100">
          <UserMinus size={17} />
        </div>
      );

    case "UPDATED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
          <Pencil size={16} />
        </div>
      );

    case "DELETED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
          <Trash2 size={16} />
        </div>
      );

    default:
      return null;
  }
};

const ActivityAvatar = ({
  name,
  avatar,
}: {
  name?: string;
  avatar?: string;
}) => {
  if (!name && !avatar) {
    return null;
  }

  return avatar ? (
    <img
      src={avatar}
      alt={name ?? "User"}
      title={name}
      className="h-6 w-6 rounded-full object-cover ring-2 ring-white"
    />
  ) : (
    <span
      title={name}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700 ring-2 ring-white"
    >
      {name?.charAt(0).toUpperCase()}
    </span>
  );
};
const Activities: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  //Fetch all activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!workspaceId) {
        return;
      }

      try {
        setLoading(true);

        const response = await axiosIns.get<Activity[]>(
          `/api/task/activity/workspace/${workspaceId}`,
        );

        setActivities(response.data);
      } catch (err) {
        console.error("Failed to fetch activities", err);
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [workspaceId]);
  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50">
              <Clock3 size={20} />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Activities
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                See what has happened in this workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Activity list */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-6">
            <h2 className="text-[13px] font-semibold text-slate-700">
              Recent activity
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="px-4 py-12 text-center text-sm text-slate-400 sm:px-6">
                Loading activities...
              </p>
            ) : error ? (
              <p className="px-4 py-12 text-center text-sm text-rose-500 sm:px-6">
                {error}
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 px-4 py-4 transition-colors duration-150 hover:bg-slate-50/70 sm:gap-4 sm:px-6"
                >
                  {/* Icon */}
                  <div className="shrink-0">
                    <ActivityIcon action={activity.action} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <p className="break-words text-sm leading-6 text-slate-600">
                        <span className="inline-flex items-center gap-2 align-middle">
                          <ActivityAvatar
                            name={activity.userName}
                            avatar={activity.userAvatar}
                          />
                          <span className="font-semibold text-slate-900">
                            {activity.userName}
                          </span>
                        </span>{" "}
                        <span className="text-slate-600">
                          {activity.message}
                        </span>
                        {(activity.action === "ASSIGNED" ||
                          activity.action === "UNASSIGNED") &&
                          (activity.assignedToName ||
                            activity.assignedToAvatar) && (
                            <span className="ml-2 inline-flex align-middle">
                              <ActivityAvatar
                                name={activity.assignedToName}
                                avatar={activity.assignedToAvatar}
                              />
                            </span>
                          )}
                      </p>

                      <span className="shrink-0 text-xs tabular-nums text-slate-400 sm:pt-0.5">
                        {activity.createdAt}
                      </span>
                    </div>

                    <p className="mt-1.5 block w-fit max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/70">
                      {activity.boardName}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Empty state */}
        {!loading && !error && activities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 sm:px-6 sm:py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Clock3 size={22} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-slate-800">
              No activity yet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Workspace activity will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Activities;
