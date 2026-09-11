import React from "react";
import {
  Clock3,
  Plus,
  MoveRight,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";

type Activity = {
  id: number;
  userName: string;
  userAvatar?: string;
  action: string;
  target: string;
  boardName: string;
  createdAt: string;
  type: "CREATED" | "MOVED" | "ASSIGNED" | "UPDATED" | "DELETED";
};

const activities: Activity[] = [
  {
    id: 1,
    userName: "Rajnish",
    action: "created",
    target: "Login page",
    boardName: "Website Development",
    createdAt: "10:42 AM",
    type: "CREATED",
  },
  {
    id: 2,
    userName: "Rahul",
    action: "moved",
    target: "Dashboard",
    boardName: "Website Development",
    createdAt: "10:18 AM",
    type: "MOVED",
  },
  {
    id: 3,
    userName: "Ankit",
    action: "was assigned to",
    target: "Fix authentication",
    boardName: "Website Development",
    createdAt: "9:52 AM",
    type: "ASSIGNED",
  },
  {
    id: 4,
    userName: "Rajnish",
    action: "updated",
    target: "Payment API",
    boardName: "Website Development",
    createdAt: "Yesterday, 6:30 PM",
    type: "UPDATED",
  },
  {
    id: 5,
    userName: "Rahul",
    action: "deleted",
    target: "Old login task",
    boardName: "Website Development",
    createdAt: "Yesterday, 5:12 PM",
    type: "DELETED",
  },
];

const ActivityIcon = ({ type }: { type: Activity["type"] }) => {
  switch (type) {
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

const Activities: React.FC = () => {
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
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 px-6 py-5 transition hover:bg-gray-50"
              >
                {/* Icon */}
                <div className="shrink-0">
                  <ActivityIcon type={activity.type} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">
                        {activity.userName}
                      </span>{" "}
                      {activity.action}{" "}
                      <span className="font-medium text-gray-900">
                        "{activity.target}"
                      </span>
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
            ))}
          </div>
        </div>

        {/* Empty state */}
        {activities.length === 0 && (
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
