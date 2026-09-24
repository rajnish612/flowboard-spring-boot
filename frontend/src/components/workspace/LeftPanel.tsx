import React, { useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { axiosIns } from "../../utils/axiosInstance";
import { Link } from "react-router";
import { LogOut } from "lucide-react";

type WorkspaceView = "mine" | "shared";
type WorkspaceToggleProps = {
  activeView: WorkspaceView;
  onChange: (view: WorkspaceView) => void;
};
const WorkspaceToggle = ({ activeView, onChange }: WorkspaceToggleProps) => {
  const isShared = activeView === "shared";
  return (
    <div className="relative mb-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200/80">
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-indigo-600 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)] motion-reduce:transition-none ${isShared ? "translate-x-full" : "translate-x-0"}`}
      />
      <button
        type="button"
        onClick={() => onChange("mine")}
        className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12.5px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeView === "mine" ? "text-white" : "text-slate-500 hover:text-slate-800"}`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" />
        </svg>
        My Workspaces
      </button>
      <button
        type="button"
        onClick={() => onChange("shared")}
        className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12.5px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeView === "shared" ? "text-white" : "text-slate-500 hover:text-slate-800"}`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="7.5" cy="7" r="2.75" />
          <path d="M2.5 16.5c0-2.6 2.2-4.5 5-4.5s5 1.9 5 4.5" />
          <path d="M13 4.6a2.75 2.75 0 0 1 0 4.8M15.5 12.5c1.3.7 2 1.9 2 4" />
        </svg>
        Shared With Me
      </button>
    </div>
  );
};
type WorkSpace = {
  id?: number;
  ownerId: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const initialWorkspaces: WorkSpace[] = [];

const dropdownOptions = [
  { label: "Boards", icon: "M3 7h18M3 12h18M3 17h9", path: "boards" },
  {
    label: "Activity",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    path: "activities",
  },
  {
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    path: "settings",
  },
  {
    label: "Billing",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    path: "boards",
  },
  {
    label: "Members",
    icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-4M16 3.13a4 4 0 010 7.75",
    path: "members",
  },
];

const LeftPanel: React.FC<{
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isMobileOpen, setIsMobileOpen }) => {
  const [fetchingWorkspaces, setFetchingWorkspaces] = useState<boolean>(true);
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>(initialWorkspaces);
  const [activeView, setActiveView] = useState<WorkspaceView>("mine");
  const [creatingWorkspace, setCreatingWorkspace] = useState<boolean>(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const createWorkspace = async () => {
    setCreatingWorkspace(true);
    if (!workspaceName || !user) return;
    const newWorkspace: WorkSpace = {
      ownerId: user?.id,
      name: workspaceName.trim(),
    };
    try {
      const res = await axiosIns.post("/api/workspace/create", newWorkspace);
      setWorkspaces((prev) => [...prev, res.data]);
    } catch {
      // The interceptor displays the request error to the user.
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const toggleDropdown = (id?: number) => {
    if (!id) return;
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      const fetchWorkspacesApi =
        activeView === "shared" ? "/api/workspace/shared" : "/api/workspace";
      setFetchingWorkspaces(true);
      try {
        const res = await axiosIns.get(fetchWorkspacesApi);
        setWorkspaces(res.data);
      } catch {
        // The interceptor displays the request error to the user.
      } finally {
        setFetchingWorkspaces(false);
      }
    };
    fetchWorkspaces();
  }, [activeView]);

  return (
    <>
   

      {isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] md:hidden"
          aria-label="Close workspace navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 min-w-[16rem] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white py-4 shadow-2xl transition-transform duration-300 md:relative md:z-auto md:flex md:translate-x-0 md:shadow-none ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7.5A2.5 2.5 0 016.5 5h3l1.6 2h6.4A2.5 2.5 0 0120 9.5v7A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-9z"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="text-sm font-medium tracking-tight text-slate-900">
                Flowboard
              </span>
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-px text-[10px] font-medium bg-indigo-50 text-indigo-700">
                  Free
                </span>
                <span className="text-[11px] text-slate-400">· Upgrade</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Close workspace navigation"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
          <WorkspaceToggle
            activeView={activeView}
            onChange={(currentView) => setActiveView(currentView)}
          />

          {/* Workspace section header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              Workspaces
            </span>
            {activeView == "mine" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group p-1 rounded-md hover:bg-slate-100 transition-colors"
                title="Create workspace"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Workspace list */}
          {fetchingWorkspaces ? (
            <div
              className="space-y-1 px-1 py-1"
              aria-label="Loading workspaces"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-2.5 rounded-lg px-2 py-2"
                >
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded-full bg-slate-100" />
                    <div className="h-2.5 w-20 rounded-full bg-slate-100/80" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            workspaces.map((ws) => (
              <div key={ws.id} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDropdown(ws.id)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition-colors group ${openDropdownId === ws.id ? "bg-slate-50" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 ring-1 ring-inset ring-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex min-w-0 flex-col items-start leading-tight">
                      <span className="max-w-40 truncate text-[13px] font-medium text-slate-800">
                        {ws.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {activeView === "mine" ? "Owner" : "Shared with you"}
                      </span>
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 group-hover:text-slate-600 ${openDropdownId === ws.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {openDropdownId === ws.id && (
                  <div className="ml-6 mt-0.5 mb-1 flex flex-col space-y-0.5 border-l border-slate-200 pl-2">
                    {dropdownOptions.map((opt) => (
                      <Link
                        to={`${opt.path + "/" + ws.id}`}
                        key={opt.label}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors w-full text-left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d={opt.icon}
                          />
                        </svg>
                        <span>{opt.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </nav>

        {/* User profile button */}
        <div className="shrink-0 px-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-slate-50"
            aria-label="Open user profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 w-full flex-col flex leading-tight">
              <span className="truncate text-left text-[13px] font-medium text-slate-800">
                {user?.name}
              </span>
              <span className="truncate text-left text-[11px] text-slate-400">
                {user?.email}
              </span>
            </div>
            <LogOut
              onClick={logout}
              className="h-4 w-4 shrink-0 text-slate-400 hover:text-slate-700 transition-colors"
            />
          </button>
        </div>
      </aside>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Create Workspace
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Give your workspace a name to get started.
              </p>
            </div>

            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createWorkspace();
                if (e.key === "Escape") {
                  setWorkspaceName("");
                  setIsCreateModalOpen(false);
                }
              }}
              placeholder="Workspace name"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
            />

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setWorkspaceName("");
                  setIsCreateModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWorkspace}
                disabled={!workspaceName.trim()}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {creatingWorkspace && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {creatingWorkspace ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftPanel;
