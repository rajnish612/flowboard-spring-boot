import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { axiosIns } from "../../../utils/axiosInstance";
type Member = {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
};
const Members: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);
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
      setMembers((prev) => [...prev, res.data]);
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
  return (
    <div className="max-w-4xl">
      {" "}
      {/* Header */}{" "}
      <div className="flex items-center justify-between mb-6">
        {" "}
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-gray-800">
            {" "}
            Workspace Members{" "}
          </h2>{" "}
          <p className="text-sm text-gray-500 mt-1">
            {" "}
            People who have access to this workspace.{" "}
          </p>{" "}
        </div>{" "}
        <button
          type="button"
          onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />{" "}
          </svg>{" "}
          Add member{" "}
        </button>{" "}
      </div>{" "}
      {/* Members list */}{" "}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {" "}
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            {" "}
            Loading members...{" "}
          </div>
        ) : members.length === 0 ? (
          <div className="px-6 py-10 text-center">
            {" "}
            <p className="text-sm font-medium text-gray-700">
              {" "}
              No members found{" "}
            </p>{" "}
            <p className="text-sm text-gray-400 mt-1">
              {" "}
              Add someone to collaborate with you.{" "}
            </p>{" "}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {" "}
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
              >
                {" "}
                <div className="flex items-center gap-4 min-w-0">
                  {" "}
                  {/* Avatar */}{" "}
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-11 h-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {" "}
                      {member.name.charAt(0).toUpperCase()}{" "}
                    </div>
                  )}{" "}
                  {/* User information */}{" "}
                  <div className="min-w-0">
                    {" "}
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {" "}
                      {member.name}{" "}
                    </p>{" "}
                    <p className="text-sm text-gray-500 truncate">
                      {" "}
                      {member.email}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Member label */}{" "}
                <span className="ml-4 shrink-0 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {" "}
                  Member{" "}
                </span>{" "}
              </div>
            ))}{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Add member modal */}{" "}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          {" "}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {" "}
            {/* Modal header */}{" "}
            <div className="px-6 pt-6">
              {" "}
              <div className="flex items-start justify-between">
                {" "}
                <div>
                  {" "}
                  <h3 className="text-xl font-bold text-gray-800">
                    {" "}
                    Add member{" "}
                  </h3>{" "}
                  <p className="text-sm text-gray-500 mt-1">
                    {" "}
                    Enter the email address of the user you want to add.{" "}
                  </p>{" "}
                </div>{" "}
                <button
                  type="button"
                  onClick={() => {
                    if (adding) return;
                    setEmail("");
                    setShowAddMember(false);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                >
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />{" "}
                  </svg>{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Input */}{" "}
            <div className="px-6 py-6">
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {" "}
                Email address{" "}
              </label>{" "}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />{" "}
            </div>{" "}
            {/* Footer */}{" "}
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              {" "}
              <button
                type="button"
                onClick={() => {
                  if (adding) return;
                  setEmail("");
                  setShowAddMember(false);
                }}
                disabled={adding}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
              >
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                type="button"
                onClick={addMember}
                disabled={adding || !email.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {" "}
                {adding ? "Adding..." : "Add member"}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default Members;
