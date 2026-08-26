import { Outlet } from "react-router";
import { useAuth } from "../../hooks/UseAuth";

const ContentPanel = () => {
  // Placeholder workspace name — replace with real data when logic is added
  const workspaceName = "My Workspace";
  const workspaceInitial = workspaceName.charAt(0).toUpperCase();
  const { user } = useAuth();
  console.log("user", user);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-y-auto relative">
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

      {/* Floating User Profile */}
      {user && (
        <div className="absolute top-5 right-8 z-10">
          <div className="group relative">
            {/* Profile Button */}
            <button className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              {user.avatar ? (
                <img
                  alt={user.name}
                  src={user.avatar}
                  width={48}
                  height={48}
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

            {/* Floating Details Card */}
            <div className="absolute right-0 top-14 w-72 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
              <div className="rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
                {/* Profile Header */}
                <div className="px-5 py-5 bg-gradient-to-br from-violet-600 to-indigo-600">
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white/30 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold border-4 border-white/30">
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
                <div className="p-4">
                  <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50">
                    <span className="text-sm text-gray-500">Plan</span>
                    <span className="text-sm font-semibold text-violet-600">
                      Free
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50">
                    <span className="text-sm text-gray-500">Account</span>
                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board Section */}
      <div className="px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ContentPanel;
