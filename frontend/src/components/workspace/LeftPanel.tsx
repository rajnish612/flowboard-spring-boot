import React, { useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { axiosIns } from "../../utils/axiosInstance";
import { Link } from "react-router";

type WorkspaceView = "mine" | "shared";
type WorkspaceToggleProps = {
  activeView: WorkspaceView;
  onChange: (view: WorkspaceView) => void;
};
const WorkspaceToggle = ({ activeView, onChange }: WorkspaceToggleProps) => {
  return (
    <div className="flex p-1 bg-gray-100 rounded-lg">
      {" "}
      <button
        type="button"
        onClick={() => onChange("mine")}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeView === "mine" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
      >
        {" "}
        My Workspaces{" "}
      </button>{" "}
      <button
        type="button"
        onClick={() => onChange("shared")}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeView === "shared" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
      >
        {" "}
        Shared With Me{" "}
      </button>{" "}
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

const LeftPanel: React.FC = () => {
  const [fetchingWorkspaces, setFetchingWorkspaces] = useState<boolean>(true);
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>(initialWorkspaces);
  const [activeView, setActiveView] = useState<WorkspaceView>("mine");
  const [creatingWorkspace, setCreatingWorkspace] = useState<boolean>(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  // function to create new workspace
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

  //Function to load initial workspaces
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
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2.5 text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:bg-indigo-50 hover:text-indigo-600 md:hidden"
          aria-label="Open workspace navigation"
          aria-expanded={isMobileOpen}
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] md:hidden"
          aria-label="Close workspace navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 min-w-[16rem] shrink-0 flex-col overflow-hidden bg-white py-4 shadow-2xl transition-transform duration-300 md:relative md:z-auto md:flex md:translate-x-0 md:shadow-lg ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4 border-b border-gray-200 pb-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 7.5A2.5 2.5 0 016.5 5h3l1.6 2h6.4A2.5 2.5 0 0120 9.5v7A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-9z"
                />
              </svg>
            </div>
            <div className="ml-3 flex flex-col">
              <span className="font-semibold text-gray-800 text-sm">
                Flowboard
              </span>
              <span className="text-xs text-gray-400">Free</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:hidden"
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
          {/* Toggle workspaces between myWorkspaces and shared workspaces */}
          <WorkspaceToggle
            activeView={activeView}
            onChange={(currentView) => setActiveView(currentView)}
          />
          {/* Workspace section header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Workspaces
            </span>
            {/* Plus icon — adds a new workspace */}
            {activeView == "mine" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-0.5 rounded hover:bg-indigo-100 transition-colors"
                title="Create workspace"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400 hover:text-indigo-600"
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
              className="space-y-2 px-2 py-1"
              aria-label="Loading workspaces"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-2 rounded-lg px-2 py-2"
                >
                  <div className="h-7 w-7 shrink-0 rounded-md bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="h-2.5 w-20 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            workspaces.map((ws) => (
              <div key={ws.id} className="rounded-lg overflow-hidden">
                {/* Workspace row */}
                <button
                  onClick={() => toggleDropdown(ws.id)}
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Workspace avatar */}
                    <div
                      className={`h-7 w-7 rounded-md bg-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex min-w-0 flex-col items-start">
                      <span className="max-w-40 truncate text-sm font-semibold text-gray-700">
                        {ws.name}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400">
                        {activeView === "mine" ? "Owner" : "Shared with you"}
                      </span>
                    </span>
                  </div>
                  {/* Chevron arrow */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${openDropdownId === ws.id ? "rotate-180" : ""}`}
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

                {/* Dropdown options */}
                {openDropdownId === ws.id && (
                  <div className="ml-9 mt-0.5 flex flex-col space-y-0.5">
                    {dropdownOptions.map((opt) => (
                      <Link
                        to={`${opt.path + "/" + ws.id}`}
                        key={opt.label}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors w-full text-left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
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
      </aside>
      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Create Workspace
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Give your workspace a name to get started.
              </p>
            </div>

            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createWorkspace();
                }

                if (e.key === "Escape") {
                  setWorkspaceName("");
                  setIsCreateModalOpen(false);
                }
              }}
              placeholder="Workspace name"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setWorkspaceName("");
                  setIsCreateModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={createWorkspace}
                disabled={!workspaceName.trim()}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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
