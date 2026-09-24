import React from "react";
import type { Card } from "../../types/task";
import { useAuth } from "../../hooks/UseAuth";

type CardItemProps = {
  card: Card;
  index: number;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, card: Card) => void;
  onDrop: (e: React.DragEvent, position: number) => void;
  onDelete: (cardId: number) => void;
};
// A single Trello-style card displayed inside a column
export const CardItem: React.FC<CardItemProps> = ({
  card,
  index,
  onClick,
  onDragStart,
  onDrop,
  onDelete,
}) => {
  const formattedDate = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
  const { user } = useAuth();
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation();
        onDrop(e, index);
      }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-px hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-900/10 active:cursor-grabbing"
    >
      {/* Delete button (hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        className="absolute right-2 top-2 rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-500/30 group-hover:opacity-100"
      >
        <svg
          className="h-3.5 w-3.5"
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

      <p className="mb-2 pr-5 text-[13px] font-medium leading-snug text-slate-900">
        {card.title}
      </p>
      {/* <p className="text-sm text-gray-800 font-medium leading-snug mb-2 pr-4">
    {card.description}
  </p> */}
      {/* Assigned member */}
      {card.assignedToAvatar && (
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="relative">
            <img
              src={card.assignedToAvatar}
              alt={card.assignedToName || "Assigned member"}
              className="h-7 w-7 rounded-full object-cover shadow-sm shadow-slate-900/10 ring-2 ring-white"
            />

            {/* Online/assigned indicator */}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-[10px] font-medium text-slate-400">
              Assigned to
            </span>

            <span className="max-w-[120px] truncate text-xs font-medium text-slate-800">
              {card.assignedToName || "Member"}
            </span>
            <span className="max-w-[120px] truncate text-[11px] text-slate-400">
              {card.assignedToEmail || "Member"}
            </span>
            {user?.id == card.assignedTo && (
              <span className="mt-0.5 w-fit rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
                You
              </span>
            )}
          </div>
        </div>
      )}
      <div className="mt-1 flex items-center gap-2">
        {formattedDate && (
          <span className="flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/70">
            <svg
              className="h-3 w-3 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formattedDate}
          </span>
        )}
        {card.description && (
          <svg
            className="h-3.5 w-3.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
