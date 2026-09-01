import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { BoardList, Card } from "../../types/task";
import { axiosIns } from "../../utils/axiosInstance";

// ─── Card Detail Modal ────────────────────────────────────────────────────────

const BASE = "/api/task";
type CardModalProps = {
  card: Card;
  onClose: () => void;
  onSave: (updated: Card) => void;
  onDelete: (cardId: number) => void;
};

const CardModal: React.FC<CardModalProps> = ({
  card,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? card.dueDate.slice(0, 10) : "",
  );
  const [saving, setSaving] = useState(false);

  //Save card details
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosIns.put<Card>(`${BASE}/card/${card.id}`, {
        title: title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onSave(res.data);
    } catch (err) {
      console.log("err in updating card: ", err.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-800">Edit Card</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description..."
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => onDelete(card.id)}
            className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Delete card
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Card Component ───────────────────────────────────────────────────────────

type CardProps = {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, card: Card) => void;
  onDelete: (cardId: number) => void;
};

const CardItem: React.FC<CardProps> = ({
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
      {/* Delete button (hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
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

      <p className="text-sm text-gray-800 font-medium leading-snug mb-2 pr-4">
        {card.title}
      </p>

      <div className="flex items-center gap-2 mt-1">
        {formattedDate && (
          <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
            <svg
              className="h-3 w-3"
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
            className="h-3.5 w-3.5 text-gray-400"
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

// ─── Add Card Form ────────────────────────────────────────────────────────────

type AddCardFormProps = {
  onClose: () => void;
  onAdd: (title: string) => Promise<void>;
};

const AddCardForm: React.FC<AddCardFormProps> = ({ onClose, onAdd }) => {
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
    <div className="flex flex-col gap-2 mt-1">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape") onClose();
        }}
        placeholder="Enter a title for this card..."
        className="w-full rounded-lg border border-indigo-300 p-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add card"}
        </button>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg
            className="h-4 w-4"
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
  );
};

// ─── Column Component ─────────────────────────────────────────────────────────

type ColumnProps = {
  list: BoardList;
  cards: Card[];
  onAddCard: (listId: number, title: string) => Promise<void>;
  onDeleteCard: (cardId: number, listId: number) => void;
  onClickCard: (card: Card) => void;
  onDeleteList: (listId: number) => void;
  onRenameList: (listId: number, newName: string) => Promise<void>;
  onDragStartCard: (e: React.DragEvent, card: Card) => void;
  onDropCard: (
    e: React.DragEvent,
    targetListId: number,
    targetPosition: number,
  ) => void;
};

const Column: React.FC<ColumnProps> = ({
  list,
  cards,
  onAddCard,
  onDeleteCard,
  onClickCard,
  onDeleteList,
  onRenameList,
  onDragStartCard,
  onDropCard,
}) => {
  const [addingCard, setAddingCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleRename = async () => {
    setIsEditing(false);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== list.name) {
      await onRenameList(list.id, trimmed);
    } else {
      setNameValue(list.name);
    }
  };

  return (
    <div
      className={`flex flex-col w-64 flex-shrink-0 rounded-2xl shadow-sm transition-colors ${
        dragOver ? "bg-indigo-50/80 ring-2 ring-indigo-300" : "bg-gray-100/80"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false);
        onDropCard(e, list.id, cards.length);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setNameValue(list.name);
                  setIsEditing(false);
                }
              }}
              className="flex-1 min-w-0 text-sm font-semibold text-gray-700 bg-white border border-indigo-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to rename"
              className="text-sm font-semibold text-gray-700 truncate cursor-default"
            >
              {list.name}
            </h3>
          )}
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5 font-medium flex-shrink-0">
            {cards.length}
          </span>
        </div>

        {/* ⋯ Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h.01M12 12h.01M19 12h.01"
              />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 w-40 rounded-xl bg-white border border-gray-200 shadow-lg py-1">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditing(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Rename list
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteList(list.id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 px-2 pb-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onClick={() => onClickCard(card)}
            onDragStart={onDragStartCard}
            onDelete={(cardId) => onDeleteCard(cardId, list.id)}
          />
        ))}
        {addingCard && (
          <AddCardForm
            onClose={() => setAddingCard(false)}
            onAdd={(title) => onAddCard(list.id, title)}
          />
        )}
      </div>

      {/* Add card button */}
      {!addingCard && (
        <button
          onClick={() => setAddingCard(true)}
          className="flex items-center gap-1.5 mx-2 mb-2 mt-1 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
        >
          <svg
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
          Add a card
        </button>
      )}
    </div>
  );
};

// ─── Add List Form ────────────────────────────────────────────────────────────

type AddListFormProps = {
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
};

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
          <svg
            className="h-4 w-4"
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
  );
};

// ─── Board (main) ─────────────────────────────────────────────────────────────

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = Number(boardId);

  const [lists, setLists] = useState<BoardList[]>([]);
  const [cards, setCards] = useState<Record<number, Card[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Drag state stored in a ref to avoid re-renders
  const dragCard = useRef<Card | null>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAllCards = async () => {
      if (!numericBoardId) return;
      setLoading(true);
      try {
        const res = await axiosIns.get<BoardList[]>(`${BASE}/list/${boardId}`);
        setLists(res.data);
        //Fetch all lists in parallel
        const entries = await Promise.all(
          res.data.map(
            (l) =>
              axiosIns
                .get<Card[]>(`${BASE}/card/${l.id}`)
                .then((r) => [l.id, r.data] as [number, Card[]]),
            // api.fetchCards(l.id).then((c) => [l.id, c] as [number, Card[]]),
          ),
        );
        console.log("entries", entries);

        setCards(Object.fromEntries(entries));
        setLoading(true);
      } catch (err) {
        setError("Failed to load board. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCards();
  }, [numericBoardId, boardId]);

  // ── List actions ────────────────────────────────────────────────────────────
  const handleAddList = useCallback(
    async (name: string) => {
      const res = await axiosIns.post<BoardList>(`${BASE}/list/create`, {
        numericBoardId,
        name,
      });
      const newList = res.data;
      // const newList = await api.createList(numericBoardId, name);
      setLists((prev) => [...prev, newList]);
      setCards((prev) => ({ ...prev, [newList.id]: [] }));
    },
    [numericBoardId],
  );

  const handleRenameList = useCallback(async (listId: number, name: string) => {
    const res = await axiosIns.put<BoardList>(`${BASE}/list/${listId}`, {
      name,
    });
    const updated = res.data;
    // const updated = await api.updateList(listId, name);
    setLists((prev) => prev.map((l) => (l.id === listId ? updated : l)));
  }, []);

  const handleDeleteList = useCallback(async (listId: number) => {
    await axiosIns.delete(`${BASE}/list/${listId}`);
    setLists((prev) => prev.filter((l) => l.id !== listId));
    setCards((prev) => {
      const next = { ...prev };
      delete next[listId];
      return next;
    });
  }, []);

  // ── Card actions ────────────────────────────────────────────────────────────
  const handleAddCard = useCallback(async (listId: number, title: string) => {
    const res = await axiosIns.post<Card>(`${BASE}/card/create`, {
      listId,
      title,
    });
    const newCard = res.data;
    // const newCard = await api.createCard(listId, title);
    setCards((prev) => ({
      ...prev,
      [listId]: [...(prev[listId] ?? []), newCard],
    }));
  }, []);

  const handleDeleteCard = useCallback(
    async (cardId: number, listId: number) => {
      await axiosIns.delete(`${BASE}/card/${cardId}`);
      setCards((prev) => ({
        ...prev,
        [listId]: (prev[listId] ?? []).filter((c) => c.id !== cardId),
      }));
      setSelectedCard(null);
    },
    [],
  );

  const handleSaveCard = useCallback((updated: Card) => {
    setCards((prev) => ({
      ...prev,
      [updated.listId]: (prev[updated.listId] ?? []).map((c) =>
        c.id === updated.id ? updated : c,
      ),
    }));
    setSelectedCard(null);
  }, []);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, card: Card) => {
    dragCard.current = card;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDrop = useCallback(
    async (
      e: React.DragEvent,
      targetListId: number,
      targetPosition: number,
    ) => {
      e.preventDefault();
      const card = dragCard.current;
      if (!card) return;
      dragCard.current = null;

      const fromListId = card.listId;
      const isSameList = fromListId === targetListId;

      // Optimistic update
      setCards((prev) => {
        const next = { ...prev };

        if (isSameList) {
          const listCards = [...(prev[fromListId] ?? [])].filter(
            (c) => c.id !== card.id,
          );
          listCards.splice(targetPosition, 0, {
            ...card,
            position: targetPosition,
          });
          next[fromListId] = listCards.map((c, i) => ({ ...c, position: i }));
        } else {
          next[fromListId] = (prev[fromListId] ?? []).filter(
            (c) => c.id !== card.id,
          );
          const targetCards = [...(prev[targetListId] ?? [])];
          targetCards.splice(targetPosition, 0, {
            ...card,
            listId: targetListId,
            position: targetPosition,
          });
          next[targetListId] = targetCards.map((c, i) => ({
            ...c,
            position: i,
          }));
        }
        return next;
      });

      // Sync to backend
      axiosIns
        .patch<Card>(`${BASE}/card/${card.id}/move`, {
          targetListId,
          targetPosition,
        })
        .then((r) => r.data);

      // await api.moveCard(card.id, targetListId, targetPosition);
    },
    [],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          <span className="text-white/80 text-sm font-medium">
            Loading board…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
        }}
      >
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white text-center">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
      }}
    >
      {/* Board Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">Board #{boardId}</h1>
          <span className="text-white/40">|</span>
          <span className="text-sm text-white/60">
            {lists.length} list{lists.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-sm text-white/80 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex items-start gap-4 px-6 py-4 overflow-x-auto flex-1">
        {lists.map((list) => (
          <Column
            key={list.id}
            list={list}
            cards={cards[list.id] ?? []}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onClickCard={setSelectedCard}
            onDeleteList={handleDeleteList}
            onRenameList={handleRenameList}
            onDragStartCard={handleDragStart}
            onDropCard={handleDrop}
          />
        ))}

        {addingList ? (
          <AddListForm
            onClose={() => setAddingList(false)}
            onAdd={handleAddList}
          />
        ) : (
          <button
            onClick={() => setAddingList(true)}
            className="flex items-center gap-2 w-64 flex-shrink-0 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors backdrop-blur-sm"
          >
            <svg
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
            Add another list
          </button>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={(cardId) => handleDeleteCard(cardId, selectedCard.listId)}
        />
      )}
    </div>
  );
};

export default Board;
