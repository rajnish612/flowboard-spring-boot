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
type Member = {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: "OWNER" | "MEMBER";
};

const ContentPanel: React.FC<{
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsMobileOpen, isMobileOpen }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const { pathname } = useLocation();
  // Start as true only when there is a workspaceId to fetch; false otherwise
  const [loading, setLoading] = useState<boolean>(!!workspaceId);
  const [membersLoading, setMembersLoading] = useState<boolean>(true);
  const workspaceInitial = workspace?.name?.charAt(0).toUpperCase() || "W";

  // Fetch members of the selected workspace.
  useEffect(() => {
    if (!workspaceId) return;
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axiosIns.get(`/api/workspace/member/${workspaceId}`);
        setMembers(res.data);
        console.log("members", res.data);
      } catch (err) {
        console.error("Unable to fetch workspace members:", err);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);
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
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3.5 sm:gap-4 sm:px-8 sm:py-5">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15 active:scale-95 md:hidden"
          aria-label="Open workspace navigation"
          aria-expanded={isMobileOpen}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {workspace != null ? (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
              {workspaceInitial}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-none sm:flex-none">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {workspace?.name || "Workspace"}
              </h1>
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Stacked member avatars (max 5) */}
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((member) =>
                    member.avatar ? (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        title={member.name}
                        className="h-5 w-5 rounded-full object-cover ring-2 ring-white sm:h-6 sm:w-6"
                      />
                    ) : (
                      <span
                        key={member.id}
                        title={member.name}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 ring-2 ring-white sm:h-6 sm:w-6 sm:text-[10px]"
                      >
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    ),
                  )}
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-slate-500">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 sm:h-12 sm:w-12 sm:rounded-2xl">
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
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-none sm:flex-none">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-400 sm:text-xl">
                No workspace selected
              </h1>
              <span className="hidden text-xs text-slate-400 sm:block">
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
              members: members,
              setMembers: setMembers,
              membersLoading: membersLoading,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ContentPanel;
