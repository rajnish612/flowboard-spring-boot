import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router";

import { axiosIns } from "../../utils/axiosInstance";
import NotificationToast from "../NotificationToast";

type Workspace = {
  id?: number;
  name: string;
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
};
type Member = { id: number; name: string; avatar?: string };

const members: Member[] = [
  { id: 1, name: "Aarav Sharma", avatar: "https://i.pravatar.cc/80?img=12" },
  { id: 2, name: "Priya Nair" },
  { id: 3, name: "Rohan Mehta", avatar: "https://i.pravatar.cc/80?img=33" },
  { id: 4, name: "Sneha Kulkarni" },
  { id: 5, name: "Vikram Rao", avatar: "https://i.pravatar.cc/80?img=51" },
  { id: 6, name: "Ananya Iyer" },
  { id: 7, name: "Karthik Reddy", avatar: "https://i.pravatar.cc/80?img=15" },
  { id: 8, name: "Meera Joshi" },
];

const ContentPanel: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const { pathname } = useLocation();
  // Start as true only when there is a workspaceId to fetch; false otherwise
  const [loading, setLoading] = useState<boolean>(!!workspaceId);
  const workspaceInitial = workspace?.name?.charAt(0).toUpperCase() || "W";

  // Fetch workspace details
  const fetchWorkspace = () => {
    if (pathname == "/dashboard") {
      setWorkspace(null);
    }

    if (!workspaceId) return;
    setLoading(true);
    axiosIns
      .get(`/api/workspace/${workspaceId}`)
      .then((res) => {
        setWorkspace(res.data);
      })
      .catch((err) => {
        console.error("Error fetching workspace details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  // ── No workspace selected ────────────────────────────────────────────────
  return (
    <div className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
      {/* Workspace Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-8 py-5">
        {workspace != null ? (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-xl font-semibold text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50">
              {workspaceInitial}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 leading-none">
              <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900">
                {workspace?.name || "Workspace"}
              </h1>
              <div className="flex items-center gap-2.5">
                {/* Stacked member avatars (max 5) */}
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((member) =>
                    member.avatar ? (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        title={member.name}
                        className="h-6 w-6 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <span
                        key={member.id}
                        title={member.name}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700 ring-2 ring-white"
                      >
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    ),
                  )}
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7.5A2.5 2.5 0 016.5 5h3l1.6 2h6.4A2.5 2.5 0 0120 9.5v7A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-9z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 leading-none">
              <h1 className="text-xl font-semibold tracking-tight text-slate-400">
                No workspace selected
              </h1>
              <span className="text-xs text-slate-400">
                Choose a workspace from the sidebar to get started.
              </span>
            </div>
          </>
        )}
        <NotificationToast />
      </div>
      {/* if workspace not selected */}
      {!workspaceId && (
        <div className="relative flex min-h-screen  flex-1b flex-col items-center justify-center gap-6 bg-slate-50 px-8">
          {/* Illustration */}
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-violet-100 to-indigo-100 flex items-center justify-center shadow-inner">
            <svg
              className="w-12 h-12 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              />
            </svg>
          </div>

          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No workspace selected
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Pick a workspace from the sidebar to view its boards, members, and
              settings — or create a new one to get started.
            </p>
          </div>

          <div className="flex gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-violet-300" />
            <span className="w-2 h-2 rounded-full bg-indigo-300" />
            <span className="w-2 h-2 rounded-full bg-purple-300" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
        {loading ? (
          <div className="flex min-h-50 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-b-indigo-600"></div>
          </div>
        ) : (
          <Outlet
            context={{
              workspace,
              setWorkspace,
              refreshWorkspace: fetchWorkspace,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ContentPanel;
