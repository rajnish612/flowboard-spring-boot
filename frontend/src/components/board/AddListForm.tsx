import React, { useState } from "react";

type AddListFormProps = {
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
};

// Inline form for adding a new list to the board
const AddListForm: React.FC<AddListFormProps> = ({ onClose, onAdd }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    await onAdd(trimmed);
    setLoading(false);
    onClose();
  };

  return (
    <div className="flex flex-col gap-2 w-64 flex-shrink-0 bg-gray-100/80 rounded-2xl p-3 shadow-sm">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onClose();
        }}
        placeholder="Enter list title..."
        className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add list"}
        </button>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AddListForm;
