import { useEffect, useState } from "react";
import type { Card } from "../../types/task";
import { axiosIns } from "../../utils/axiosInstance";
import { useParams } from "react-router";
import { useAuth } from "../../hooks/UseAuth";
const BASE = "/api/task";
type CardModalProps = {
  card: Card;
  onClose: () => void;
  onSave: (updated: Card) => void;
  onDelete: (cardId: number) => void;
  workspaceId: number | null;
};

type Member = {
  name: string;
  email: string;
  userId: number;
  avatar?: string | null;
};

type MembersPage = {
  content: Member[];
};
// Modal for viewing and editing a card's details
export const CardModal: React.FC<CardModalProps> = ({
  card,
  workspaceId,
  onClose,
  onSave,
  onDelete,
}) => {
  const { user } = useAuth();
  const { boardId } = useParams<{ boardId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState<boolean>(false);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? card.dueDate.slice(0, 10) : "",
  );
  const [assignedTo, setAssignedTo] = useState(
    card.assignedTo ? String(card.assignedTo) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Fetch members
  useEffect(() => {
    if (!workspaceId) return;
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const res = await axiosIns.get<MembersPage>(
          `/api/workspace/member/${workspaceId}`,
          { params: { page: 0, size: 100 } },
        );
        setMembers(res.data.content);
      } catch (err) {
        console.error("Unable to fetch workspace members:", err);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);

  //Save card details
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await axiosIns.put<Card>(
        `${BASE}/card/${card.id}/${boardId}`,
        {
          title: title,
          description,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          assignedTo: assignedTo ? Number(assignedTo) : undefined,
        },
      );

      onSave(res.data);
    } catch {
      setError("Failed to save card. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Edit Card
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <svg
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

        {/* Form */}
        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* assign to members options */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Assign to
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!membersLoading) {
                    setIsMemberDropdownOpen((prev) => !prev);
                  }
                }}
                disabled={membersLoading}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {membersLoading ? (
                    <>
                      <span className="h-6 w-6 animate-pulse rounded-full bg-slate-200" />
                      <span className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
                    </>
                  ) : (() => {
                    const selected = members.find(
                      (m) => String(m.userId) === assignedTo,
                    );

                    return selected ? (
                      <>
                        {selected.avatar ? (
                          <img
                            src={selected.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                            {selected.name?.charAt(0).toUpperCase()}
                          </span>
                        )}

                        <span className="truncate font-medium">
                          {selected.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    );
                  })()}
                </div>

                <svg
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    isMemberDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </button>

              {isMemberDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-1.5 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignedTo("");
                      setIsMemberDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                      —
                    </span>
                    Unassigned
                  </button>

                  {membersLoading ? (
                    <div className="space-y-2 px-2 py-3">
                      {[...Array(3)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <span className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />
                          <span className="h-3 flex-1 animate-pulse rounded-full bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    members
                      .filter((member) => user?.id !== member.userId)
                      .map((member) => {
                      const selected = assignedTo === String(member.userId);

                      return (
                        <button
                          key={member.userId}
                          type="button"
                          onClick={() => {
                            setAssignedTo(String(member.userId));
                            setIsMemberDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
                            selected ? "bg-indigo-50" : "hover:bg-slate-50"
                          }`}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt=""
                              className="h-7 w-7 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                              {member.name?.charAt(0).toUpperCase()}
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-slate-700">
                              {member.name}
                            </p>
                            <p className="truncate text-[10px] text-slate-400">
                              {member.email}
                            </p>
                          </div>

                          {selected && (
                            <span className="text-xs font-semibold text-indigo-600">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                      })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          {error && <p className="mr-4 text-sm text-rose-600">{error}</p>}
          <button
            onClick={() => onDelete(card.id)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
          >
            Delete card
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
