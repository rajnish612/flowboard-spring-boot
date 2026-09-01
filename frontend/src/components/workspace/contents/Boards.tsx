import React, { useState } from "react";
import { axiosIns } from "../../../utils/axiosInstance";
import { useParams, Link } from "react-router";
import { isAxiosError } from "axios";

type Board = {
  id?: number;
  name: string;
  description: string;
};

const BoardCard: React.FC<Board> = ({ name }) => {
  return (
    <div
      className={`relative w-52 h-32 rounded-xl bg-blue-100 cursor-pointer shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 overflow-hidden group`}
    >
      {/* Board title */}
      <span className="absolute top-3 left-3 text-white font-semibold text-sm drop-shadow">
        {name}
      </span>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />

      {/* Star icon */}
      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white/80 hover:text-yellow-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    </div>
  );
};

type CreateBoardCardProps = {
  onClick: () => void;
};

// Create new board card
const CreateBoardCard: React.FC<CreateBoardCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-52 h-32 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 mb-1"
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
      <span className="text-sm text-gray-400 group-hover:text-indigo-500 font-medium">
        Create new board
      </span>
    </div>
  );
};

const Boards: React.FC = () => {
  const [boards, setBoards] = React.useState<Board[]>([]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [boardDTO, setBoardDTO] = useState<Board>({
    name: "",
    description: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  React.useEffect(() => {
    //Method to fetch initial boards based on the selected workspace
    axiosIns
      .get(`/api/workspace/board/${workspaceId}`)
      .then((res) => setBoards(res.data))
      .catch();
  }, [workspaceId]);

  // Function to create a new board
  const createBoard = async () => {
    const name = boardDTO.name.trim();
    const description = boardDTO.description.trim();
    const currentWorkspaceId = Number(workspaceId);

    if (!name || !description || !currentWorkspaceId) {
      return;
    }

    const newBoard: Board & { workspaceId: number } = {
      name,
      description,
      workspaceId: currentWorkspaceId,
    };

    try {
      setCreating(true);

      const res = await axiosIns.post("/api/workspace/board/create", newBoard);

      if (res.data) {
        setBoards((prev) => [...prev, res.data]);

        setBoardDTO({
          name: "",
          description: "",
        });

        setIsCreateModalOpen(false);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error(
          "Unable to create board:",
          err.response?.data?.message || err.message,
        );
      } else {
        console.error("Unable to create board:", err);
      }
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    if (creating) return;

    setBoardDTO({
      name: "",
      description: "",
    });

    setIsCreateModalOpen(false);
  };
  return (
    <div className="flex flex-col gap-4">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
          />
        </svg>
        <h2 className="text-base font-semibold text-gray-700">Your Boards</h2>
      </div>

      {/* Board grid */}
      <div className="flex flex-wrap gap-4">
        {boards.map((board) => (
          <Link key={board.id ?? board.name} to={`/board/${board.id}`}>
            <BoardCard
              description={board.description}
              name={board.name}
            />
          </Link>
        ))}
        <CreateBoardCard onClick={() => setIsCreateModalOpen(true)} />
      </div>
      {/* Create board modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="px-6 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Create a board
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Give your board a name and description.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
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

            {/* Form */}
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Board name
                </label>

                <input
                  type="text"
                  value={boardDTO.name}
                  onChange={(e) =>
                    setBoardDTO((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      closeModal();
                    }
                  }}
                  placeholder="e.g. Website Development"
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={boardDTO.description}
                  onChange={(e) =>
                    setBoardDTO((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What is this board for?"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createBoard}
                disabled={
                  creating ||
                  !boardDTO.name.trim() ||
                  !boardDTO.description.trim()
                }
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {creating ? "Creating..." : "Create board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boards;
