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
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Plus size={17} />
        </div>
      );

    case "MOVED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <MoveRight size={17} />
        </div>
      );

    case "ASSIGNED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <UserPlus size={17} />
        </div>
      );

    case "UNASSIGNED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <UserMinus size={17} />
        </div>
      );

    case "UPDATED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Pencil size={16} />
        </div>
      );

    case "DELETED":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
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
      className="h-7 w-7 rounded-full object-cover"
    />
  ) : (
    <span
      title={name}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
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
    <div className="min-h-full bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Clock3 size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">Activities</h1>

              <p className="mt-1 text-sm text-gray-500">
                See what has happened in this workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Activity list */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Recent activity
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <p className="px-6 py-10 text-center text-sm text-gray-500">
                Loading activities...
              </p>
            ) : error ? (
              <p className="px-6 py-10 text-center text-sm text-red-500">
                {error}
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 px-6 py-5 transition hover:bg-gray-50"
                >
                  {/* Icon */}
                  <div className="shrink-0">
                    <ActivityIcon action={activity.action} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2 align-middle">
                          <ActivityAvatar
                            name={activity.userName}
                            avatar={activity.userAvatar}
                          />
                          <span className="font-semibold text-gray-900">
                            {activity.userName}
                          </span>
                        </span>{" "}
                        <span className="font-medium text-gray-900">
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

                      <span className="shrink-0 text-xs text-gray-400">
                        {activity.createdAt}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-400">
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
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <Clock3 size={32} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-sm font-semibold text-gray-800">
              No activity yet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Workspace activity will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
