import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { axiosIns } from "../../utils/axiosInstance";

type WorkSpace = {
  ownerId: number;
  name: string;
};

const initialWorkspaces: WorkSpace[] = [];

const dropdownOptions = [
  { label: "Boards", icon: "M3 7h18M3 12h18M3 17h9" },
  { label: "Activity", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  {
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    label: "Billing",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
];

const LeftPanel: React.FC = () => {
  const [fetchingWorkspaces, setFetchingWorkspaces] = useState<boolean>(true);
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>(initialWorkspaces);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  // function to create new workspace
  const createWorkspace = async () => {
    if (!workspaceName || !user) return;
    const newWorkspace: WorkSpace = {
      ownerId: user?.id,
      name: workspaceName.trim(),
    };
    try {
      const res = await axiosIns.post("/api/workspace/create", newWorkspace);
      setWorkspaces((prev) => [...prev, res.data]);
      console.log("workspace created", res.data);
    } catch (err) {
      console.log("unable to create workspace", err.response.data.message);
    }
  };
  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  React.useEffect(() => {
    //Function to load workspaces during component render
    axiosIns
      .get("/api/workspace")
      .then((res) => setWorkspaces(res.data))
      .catch((err) =>
        console.log("Unable to ferch workspaces", err.response.data.message),
      )
      .finally(() => setFetchingWorkspaces(false));
  }, []);
  return (
    <>
      <aside className="w-64 min-w-[16rem] bg-white shadow-lg py-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center px-4 mb-4 border-b border-gray-200 pb-4">
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
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
          </div>
          <div className="ml-3 flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">
              Trello Workspace
            </span>
            <span className="text-xs text-gray-400">Free</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
          {/* Workspace section header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Workspaces
            </span>
            {/* Plus icon — adds a new workspace */}
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
          </div>

          {/* Workspace list */}
          {workspaces.map((ws) => (
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
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {ws.name}
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
                    <button
                      key={opt.label}
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
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
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftPanel;
