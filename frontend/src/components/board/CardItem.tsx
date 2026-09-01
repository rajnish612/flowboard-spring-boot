import React from "react";
import type { Card } from "../../types/task";

type CardItemProps = {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, card: Card) => void;
  onDelete: (cardId: number) => void;
};

// A single Trello-style card displayed inside a column
const CardItem: React.FC<CardItemProps> = ({
  card,
  onClick,
  onDragStart,
  onDelete,
}) => {
  const formattedDate = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-150 group relative"
    >
      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <p className="text-sm text-gray-800 font-medium leading-snug mb-2 pr-4">
        {card.title}
      </p>

      <div className="flex items-center gap-2 mt-1">
        {formattedDate && (
          <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </span>
        )}
        {card.description && (
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default CardItem;
