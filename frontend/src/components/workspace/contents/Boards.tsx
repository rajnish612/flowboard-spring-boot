import React from "react";

type BoardCardProps = {
  title: string;
  bg: string;
};

const boardColors = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-violet-400 to-violet-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-orange-400 to-orange-600",
];

const mockBoards: BoardCardProps[] = [
  { title: "Project Alpha", bg: boardColors[0] },
  { title: "Design System", bg: boardColors[1] },
  { title: "Marketing", bg: boardColors[2] },
  { title: "Roadmap 2025", bg: boardColors[3] },
];

const BoardCard: React.FC<BoardCardProps> = ({ title, bg }) => {
  return (
    <div
      className={`relative w-52 h-32 rounded-xl ${bg} cursor-pointer shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 overflow-hidden group`}
    >
      {/* Board title */}
      <span className="absolute top-3 left-3 text-white font-semibold text-sm drop-shadow">
        {title}
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

// Create new board card
const CreateBoardCard: React.FC = () => {
  return (
    <div className="w-52 h-32 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 mb-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-sm text-gray-400 group-hover:text-indigo-500 font-medium">
        Create new board
      </span>
    </div>
  );
};

const Boards: React.FC = () => {
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
        {mockBoards.map((board) => (
          <BoardCard key={board.title} title={board.title} bg={board.bg} />
        ))}
        <CreateBoardCard />
      </div>
    </div>
  );
};

export default Boards;
