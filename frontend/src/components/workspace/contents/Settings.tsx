import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { axiosIns } from "../../../utils/axiosInstance";
import { useWorkspaceContext } from "../../../hooks/useOutletContext";

const Settings: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspace, setWorkspace } = useWorkspaceContext();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  //Edit name of workspace and save it
  const handleSave = async () => {
    const trimmedName = workspace?.name.trim();

    if (!trimmedName) {
      setError("Workspace name cannot be empty.");
      return;
    }

    if (!workspaceId) {
      setError("Workspace ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await axiosIns.put(`/api/workspace/${workspaceId}`, {
        name: trimmedName,
      });

      setMessage("Workspace name updated successfully.");
    } catch (err: unknown) {
      console.error("Unable to update workspace:", err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to update workspace.");
      } else {
        setError("Unable to update workspace.");
      }
    } finally {
      setSaving(false);
    }
  };

  //Delete workspace
  const handleDelete = async () => {
    if (!workspaceId) {
      setError("Workspace ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this workspace?\n\n" +
        "This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await axiosIns.delete(`/api/workspace/${workspaceId}`);

      // Return to the dashboard/workspace selection screen.
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Unable to delete workspace:", err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to delete workspace.");
      } else {
        setError("Unable to delete workspace.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
   <div className="max-w-3xl">
  {/* Page heading */}
  <div className="mb-8">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
      Workspace Settings
    </h1>
 
    <p className="mt-1 text-sm text-slate-500">
      Manage the basic settings of this workspace.
    </p>
  </div>
 
  {/* General settings */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
      <h2 className="text-[15px] font-semibold text-slate-900">General</h2>
 
      <p className="mt-0.5 text-sm text-slate-500">
        Update your workspace name.
      </p>
    </div>
 
    <div className="px-6 py-6">
      <label
        htmlFor="workspace-name"
        className="mb-2 block text-[13px] font-medium text-slate-700"
      >
        Workspace name
      </label>
 
      <input
        id="workspace-name"
        type="text"
        value={workspace?.name}
        onChange={(e) => {
          if (workspace) {
            setWorkspace({
              ...workspace,
              name: e.target.value,
            });
          }
          setError("");
          setMessage("");
        }}
        placeholder="Enter workspace name"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
 
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
 
      {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
 
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !workspace?.name.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  </section>
 
  {/* Danger zone */}
  <section className="mt-8 overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm shadow-slate-900/5">
    <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-4">
      <h2 className="text-[15px] font-semibold text-rose-600">Danger Zone</h2>
 
      <p className="mt-0.5 text-sm text-slate-500">
        These actions can permanently affect this workspace.
      </p>
    </div>
 
    <div className="flex items-center justify-between gap-6 px-6 py-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Delete workspace
        </h3>
 
        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
          Permanently delete this workspace and its associated boards, lists,
          and cards. This action cannot be undone.
        </p>
      </div>
 
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete workspace"}
      </button>
    </div>
  </section>
</div>
  );
};

export default Settings;
