import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { axiosIns } from "../../../utils/axiosInstance";
import { useWorkspaceContext } from "../../../hooks/useOutletContext";
type Workspace = {
  name: string;
  ownerId?: number;
  createdAt: Date;
  updatedAt: Date;
};
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
        <h1 className="text-2xl font-bold text-gray-800">Workspace Settings</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage the basic settings of this workspace.
        </p>
      </div>

      {/* General settings */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">General</h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your workspace name.
          </p>
        </div>

        <div className="px-6 py-6">
          <label
            htmlFor="workspace-name"
            className="mb-2 block text-sm font-medium text-gray-700"
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
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          {message && <p className="mt-2 text-sm text-green-600">{message}</p>}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !workspace?.name.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-8 rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>

          <p className="mt-1 text-sm text-gray-500">
            These actions can permanently affect this workspace.
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 px-6 py-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Delete workspace
            </h3>

            <p className="mt-1 max-w-xl text-sm text-gray-500">
              Permanently delete this workspace and its associated boards,
              lists, and cards. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete workspace"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
