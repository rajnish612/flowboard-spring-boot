import React, {  useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { axiosIns } from "../../../utils/axiosInstance";
import { useAuth } from "../../../hooks/UseAuth";
import { useWorkspaceContext } from "../../../hooks/useOutletContext";
type Member = {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: "OWNER" | "MEMBER";
};
type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
};
const Members: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const { user } = useAuth();
  const {
    workspace,
    members,
    setMembers,
    membersLoading: loading,
  } = useWorkspaceContext();
  const canManageMembers = Boolean(user?.id && workspace?.ownerId === user.id);

  // Add a new member using their email.
  const addMember = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !workspaceId) {
      return;
    }
    try {
      setAdding(true);
      const res = await axiosIns.post("/api/workspace/member", {
        workspaceId: Number(workspaceId),
        email: trimmedEmail,
      });
      setMembers((prev) => [...prev, { ...res.data }]);
      setEmail("");
      setShowAddMember(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          "Unable to add member:",
          err.response?.data?.message ?? err.message,
        );
      } else {
        console.error("Unable to add member:", err);
      }
    } finally {
      setAdding(false);
    }
  };

  //Remove member from the workspace
  const removeMember = async (member: Member) => {
    if (!workspaceId || !canManageMembers || member.role === "OWNER") return;

    const confirmed = window.confirm(
      `Remove ${member.name} from this workspace?`,
    );
    if (!confirmed) return;

    try {
      setRemovingMemberId(member.userId);
      await axiosIns.delete(
        `/api/workspace/member/${workspaceId}/${member.userId}`,
      );
      setMembers((prev) =>
        prev.filter((currentMember) => currentMember.userId !== member.userId),
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          "Unable to remove member:",
          err.response?.data?.message ?? err.message,
        );
      } else {
        console.error("Unable to remove member:", err);
      }
    } finally {
      setRemovingMemberId(null);
    }
  };

  //Search users using email
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!e.target.value) return;
    try {
      const res = await axiosIns.get(`/api/auth/user/search/${e.target.value}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Unable to search users:", err);
    }
  };
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Workspace Members
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            People who have access to this workspace.
          </p>
        </div>
        {canManageMembers && (
          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
            Add member
          </button>
        )}
      </div>

      {/* Members list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No members found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add someone to collaborate with you.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-6 py-4 transition-colors duration-150 hover:bg-slate-50/70"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {/* Avatar */}
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm shadow-slate-900/10"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white ring-2 ring-white shadow-sm shadow-indigo-500/25">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* User information */}
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {member.name}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-slate-500">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Member role */}
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      member.role === "OWNER"
                        ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
                        : "bg-slate-50 text-slate-600 ring-slate-200"
                    }`}
                  >
                    {member.role === "OWNER" ? "Owner" : "Member"}
                  </span>
                  {canManageMembers && member.role !== "OWNER" && (
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      disabled={removingMemberId === member.userId}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingMemberId === member.userId
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            {/* Modal header */}
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Add member
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the email address of the user you want to add.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (adding) return;
                    setEmail("");
                    setShowAddMember(false);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="px-6 py-6">
              <label className="mb-2 block text-[13px] font-medium text-slate-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={handleSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addMember();
                  }
                  if (e.key === "Escape" && !adding) {
                    setEmail("");
                    setShowAddMember(false);
                  }
                }}
                placeholder="user@example.com"
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setEmail(user.email);
                        setSearchResults([]);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <img
                        src={user.avatar ?? undefined}
                        alt={user.name}
                        className="h-8 w-8 rounded-full bg-slate-100 object-cover ring-2 ring-white"
                      />

                      <div className="leading-tight">
                        <p className="text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (adding) return;
                  setEmail("");
                  setShowAddMember(false);
                }}
                disabled={adding}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addMember}
                disabled={adding || !email.trim()}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {adding ? "Adding..." : "Add member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Members;
