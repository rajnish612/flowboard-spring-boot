import React, { useState, useEffect } from "react";
import { Outlet, useParams, useOutletContext } from "react-router";

import { useAuth } from "../../hooks/UseAuth";
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
  const { user, logout } = useAuth();

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
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-screen gap-6 px-8 relative">
        {/* Floating user profile */}
        {user && (
          <div className="absolute top-5 right-8 z-10">
            <div className="group relative">
              <button className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                {user.avatar ? (
                  <img
                    alt={user.name}
                    src={user.avatar}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-800">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
                <svg
                  className="w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute right-0 top-14 w-72 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
                  <div className="px-5 py-5 bg-gradient-to-br from-violet-600 to-indigo-600">
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-4 border-white/30 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center text-xl font-bold border-4 border-white/30">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white truncate">
                          {user.name}
                        </h2>
                        <p className="text-sm text-violet-100 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                      <span className="text-sm text-gray-500">Plan</span>
                      <span className="text-sm font-semibold text-violet-600">
                        Free
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                      <span className="text-sm text-gray-500">Account</span>
                      <span className="text-sm font-medium text-green-600">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Illustration */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shadow-inner">
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
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-y-auto relative">
      {/* Workspace Header */}
      <div className="flex items-center gap-4 px-8 py-6 border-b border-violet-400 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md">
        <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 border border-white/30">
          {workspaceInitial}
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">
            {workspace?.name || "Workspace"}
          </h1>
          <span className="text-xs text-violet-200 mt-0.5">Free Plan</span>
        </div>
      </div>

      {/* Floating User Profile */}
      {user && (
        <div className="absolute top-5 right-8 z-10">
          <div className="group relative">
            {/* Profile Trigger Button */}
            <button className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              {user.avatar ? (
                <img
                  alt={user.name}
                  src={user.avatar}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-800">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>

              <svg
                className="w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Floating Dropdown Card */}
            <div className="absolute right-0 top-14 w-72 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
              <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
                {/* Profile Header */}
                <div className="px-5 py-5 bg-gradient-to-br from-violet-600 to-indigo-600">
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover border-4 border-white/30 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center text-xl font-bold border-4 border-white/30">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">
                        {user.name}
                      </h2>
                      <p className="text-sm text-violet-100 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                    <span className="text-sm text-gray-500">Plan</span>
                    <span className="text-sm font-semibold text-violet-600">
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                    <span className="text-sm text-gray-500">Account</span>
                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
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
