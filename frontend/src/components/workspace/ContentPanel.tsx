import { Outlet } from "react-router";

const ContentPanel = () => {
  // Placeholder workspace name — replace with real data when logic is added
  const workspaceName = "My Workspace";
  const workspaceInitial = workspaceName.charAt(0).toUpperCase();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-y-auto">
      {/* Workspace Header */}
      <div className="flex items-center gap-4 px-8 py-6 border-b border-violet-400 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md">
        <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 border border-white/30">
          {workspaceInitial}
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">{workspaceName}</h1>
          <span className="text-xs text-violet-200 mt-0.5">Free Plan</span>
        </div>
      </div>

      {/* Board Section */}
      <div className="px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ContentPanel;
