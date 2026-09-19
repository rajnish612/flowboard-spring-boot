import React, { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router";

import { axiosIns } from "../../utils/axiosInstance";

type Workspace = {
  id?: number;
  name: string;
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
};

const ContentPanel: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  // Start as true only when there is a workspaceId to fetch; false otherwise
  const [loading, setLoading] = useState<boolean>(!!workspaceId);
  const workspaceInitial = workspace?.name?.charAt(0).toUpperCase() || "W";

  // Fetch workspace details
  const fetchWorkspace = () => {
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
    if (!workspaceId) return;
    fetchWorkspace();
  }, [workspaceId]);

  // ── No workspace selected ────────────────────────────────────────────────
  if (!workspaceId) {
    return (
      <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-slate-50 px-8">
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
    );
  }

  return (
    <div className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
      {/* Workspace Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-8 py-6 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
          {workspaceInitial}
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {workspace?.name || "Workspace"}
          </h1>
          <span className="mt-0.5 text-xs font-medium text-slate-400">Free Plan</span>
        </div>

      </div>

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
