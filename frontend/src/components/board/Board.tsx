import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { BoardList, Card } from "../../types/task";
import { axiosIns } from "../../utils/axiosInstance";
import { CardItem } from "./CardItem";
import { CardModal } from "./CardModal";
import { AddListForm } from "./AddListForm";
import { AddCardForm } from "./AddCardForm";
import {
  useBoardSocket,
  type BoardSocketEvent,
} from "../../websocket/boardSocket";
import { useAuth } from "../../hooks/UseAuth";
// ─── Card Detail Modal ────────────────────────────────────────────────────────

const BASE = "/api/task";

// ─── Column Component ─────────────────────────────────────────────────────────

type ColumnProps = {
  list: BoardList;
  listIndex: number;
  cards: Card[];
  onAddCard: (listId: number, title: string) => Promise<void>;
  onDeleteCard: (cardId: number, listId: number) => void;
  onClickCard: (card: Card) => void;
  onDeleteList: (listId: number) => void;
  onRenameList: (listId: number, newName: string) => Promise<void>;
  onDragStartList: (e: React.DragEvent, listId: number) => void;
  onDragEndList: () => void;
  isListDragging: () => boolean;
  onDropList: (e: React.DragEvent, targetIndex: number) => void;
  onDragStartCard: (e: React.DragEvent, card: Card) => void;
  onDropCard: (
    e: React.DragEvent,
    targetListId: number,
    targetPosition: number,
  ) => void;
};

const Column: React.FC<ColumnProps> = ({
  list,
  listIndex,
  cards,
  onAddCard,
  onDeleteCard,
  onClickCard,
  onDeleteList,
  onRenameList,
  onDragStartList,
  onDragEndList,
  isListDragging,
  onDropList,
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
      className={`flex w-64 shrink-0 flex-col rounded-2xl shadow-sm shadow-slate-900/5 ring-1 ring-inset transition-colors duration-200 ${
        dragOver
          ? "bg-indigo-50/80 ring-2 ring-indigo-300"
          : "bg-slate-100/80 ring-slate-200/80"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false);
        if (isListDragging()) {
          onDropList(e, listIndex);
        } else {
          onDropCard(e, list.id, cards.length);
        }
      }}
    >
      {/* Header */}
      <div
        draggable
        onDragStart={(e) => onDragStartList(e, list.id)}
        onDragEnd={onDragEndList}
        className="flex cursor-grab items-center justify-between px-3 pb-2 pt-3 active:cursor-grabbing"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
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
              className="min-w-0 flex-1 rounded-lg border border-indigo-500 bg-white px-2 py-0.5 text-[13px] font-semibold text-slate-900 outline-none ring-4 ring-indigo-500/10"
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to rename"
              className="cursor-default truncate text-[13px] font-semibold tracking-tight text-slate-800"
            >
              {list.name}
            </h3>
          )}
          <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 ring-1 ring-inset ring-slate-200">
            {cards.length}
          </span>
        </div>

        {/* ⋯ Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
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
            <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditing(true);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
              >
                Rename list
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteList(list.id);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-rose-600 transition-colors hover:bg-rose-50"
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex max-h-[calc(100vh-220px)] flex-col gap-2 overflow-y-auto px-2 pb-2">
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            onClick={() => onClickCard(card)}
            onDragStart={onDragStartCard}
            onDrop={(e, position) => onDropCard(e, list.id, position)}
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
          className="mx-2 mb-2 mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
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

// ─── Board (main) ─────────────────────────────────────────────────────────────
type Member = {
  // id: number;
  name: string;
  email: string;
  userId: number;
};
const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { user } = useAuth();
  const numericBoardId = Number(boardId);
  const [boardBackground, setBoardBackground] = React.useState<string>("");
  const [lists, setLists] = useState<BoardList[]>([]);
  const [cards, setCards] = useState<Record<number, Card[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  // Drag state stored in a ref to avoid re-renders
  const dragCard = useRef<Card | null>(null);
  const dragListId = useRef<number | null>(null);
  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchAllCardsAndLists = async () => {
      if (!numericBoardId) return;
      setLoading(true);
      try {
        const [boardRes, listsRes] = await Promise.all([
          axiosIns.get<{ workspaceId: number; backgroundImage: string }>(
            `/api/workspace/board/detail/${boardId}`,
          ),
          axiosIns.get<BoardList[]>(`${BASE}/list/${boardId}`),
        ]);
        setBoardBackground(boardRes.data.backgroundImage);
        const membersRes = await axiosIns.get<Member[]>(
          `/api/workspace/member/${boardRes.data.workspaceId}`,
        );
        setMembers(membersRes.data);
        const res = listsRes;
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

        setCards(Object.fromEntries(entries));
        setLoading(true);
      } catch {
        setError("Failed to load board. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCardsAndLists();
  }, [numericBoardId, boardId]);

  // ── List actions ────────────────────────────────────────────────────────────
  const handleAddList = useCallback(
    async (name: string) => {
      try {
        const res = await axiosIns.post<BoardList>(`${BASE}/list/create`, {
          boardId: numericBoardId,
          name,
        });
        const newList = res.data;
        setLists((prev) => [...prev, newList]);
        setCards((prev) => ({ ...prev, [newList.id]: [] }));
      } catch {
        setError("Failed to add list. Please try again.");
      }
    },
    [numericBoardId],
  );

  const handleRenameList = useCallback(async (listId: number, name: string) => {
    try {
      const res = await axiosIns.put<BoardList>(`${BASE}/list/${listId}`, {
        name,
      });
      const updated = res.data;
      setLists((prev) => prev.map((l) => (l.id === listId ? updated : l)));
    } catch {
      setError("Failed to rename list. Please try again.");
    }
  }, []);

  const handleDeleteList = useCallback(
    async (listId: number) => {
      try {
        await axiosIns.delete(`${BASE}/list/${listId}/${numericBoardId}`);
        setLists((prev) => prev.filter((l) => l.id !== listId));
        setCards((prev) => {
          const next = { ...prev };
          delete next[listId];
          return next;
        });
      } catch {
        setError("Failed to delete list. Please try again.");
      }
    },
    [numericBoardId],
  );

  const handleDragStartList = useCallback(
    (e: React.DragEvent, listId: number) => {
      dragListId.current = listId;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/x-board-list", String(listId));
    },
    [],
  );

  const handleDragEndList = useCallback(() => {
    dragListId.current = null;
  }, []);

  const isListDragging = useCallback(() => dragListId.current !== null, []);

  const handleDropList = useCallback(
    async (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const listId = dragListId.current;
      dragListId.current = null;
      if (listId === null) return;

      const previousLists = lists;
      const sourceIndex = previousLists.findIndex((item) => item.id === listId);
      if (sourceIndex === -1) return;

      const nextLists = [...previousLists];
      const [movedList] = nextLists.splice(sourceIndex, 1);
      const calculatedPosition =
        sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const newPosition = Math.max(
        0,
        Math.min(
          nextLists.length,
          calculatedPosition === sourceIndex && targetIndex > sourceIndex
            ? sourceIndex + 1
            : calculatedPosition,
        ),
      );
      nextLists.splice(newPosition, 0, movedList);
      setLists(nextLists.map((item, position) => ({ ...item, position })));

      try {
        const response = await axiosIns.post<BoardList>(
          `${BASE}/list/${listId}/reorder`,
          { position: newPosition },
        );
        setLists((current) =>
          current
            .map((item) => (item.id === listId ? response.data : item))
            .sort((a, b) => a.position - b.position),
        );
      } catch (moveError) {
        console.error("List move request failed", moveError);
        setLists(previousLists);
        setError("Failed to move list. Please try again.");
      }
    },
    [lists],
  );

  // ── Card actions ────────────────────────────────────────────────────────────
  const handleAddCard = useCallback(
    async (listId: number, title: string) => {
      try {
        const res = await axiosIns.post<Card>(
          `${BASE}/card/create/${boardId}`,
          {
            listId,
            title,
          },
        );
        const newCard = res.data;
        setCards((prev) => ({
          ...prev,
          [listId]: [...(prev[listId] ?? []), newCard],
        }));
      } catch {
        setError("Failed to add card. Please try again.");
      }
    },
    [boardId],
  );

  const handleDeleteCard = useCallback(
    async (cardId: number, listId: number) => {
      try {
        await axiosIns.delete(`${BASE}/card/${cardId}/${boardId}`);
        setCards((prev) => ({
          ...prev,
          [listId]: (prev[listId] ?? []).filter((c) => c.id !== cardId),
        }));
        setSelectedCard(null);
      } catch {
        setError("Failed to delete card. Please try again.");
      }
    },
    [boardId],
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
      const previousCards = cards;

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
      try {
        await axiosIns.post<Card>(`${BASE}/card/${card.id}/move/${boardId}`, {
          targetListId,
          position: targetPosition,
        });
      } catch {
        setCards(previousCards);
        setError("Failed to move card. Please try again.");
      }
    },
    [boardId, cards],
  );

  //Board socket events management
  const handleBoardEvent = useCallback(
    (event: BoardSocketEvent) => {
      if (event.userId == user?.id) {
        return;
      }

      switch (event.type) {
        case "CARD_MOVED": //move card
          setCards((prev) => {
            const updated = { ...prev };

            // Remove card from whatever list it currently exists in
            for (const listId of Object.keys(updated)) {
              updated[Number(listId)] = updated[Number(listId)].filter(
                (card) => card.id !== event.data.id,
              );
            }

            // Add it to the target list at the correct position
            const targetListCards = [...(updated[event.data.listId] ?? [])];

            targetListCards.splice(event.data.position, 0, event.data);

            updated[event.data.listId] = targetListCards;

            return updated;
          });
          break;

        case "CARD_CREATED":
          // add card
          setCards((prev) => ({
            ...prev,
            [event.data.listId]: [
              ...(prev[event.data.listId] ?? []),
              event.data,
            ],
          }));
          break;

        case "CARD_UPDATED":
          setCards((prev) => {
            const updated = { ...prev };

            updated[Number(event.data.listId)] = updated[
              Number(event.data.listId)
            ].map((card) => (card.id == event.data.id ? event.data : card));

            return updated;
          });

          break; // update card

        case "CARD_DELETED": // remove card
          setCards((prev) => {
            const updated = { ...prev };

            for (const listId of Object.keys(updated)) {
              updated[Number(listId)] = updated[Number(listId)].filter(
                (card) => card.id !== event.data,
              );
            }

            return updated;
          });

          break;

        case "LIST_CREATED": // add list
          setLists((prev) => [...prev, event.data]);

          break;

        case "LIST_UPDATED": // update list
          setLists((previousLists) =>
            previousLists.map((list) =>
              list.id === event.data.id ? event.data : list,
            ),
          );
          break;

        case "LIST_REORDERED":
          setLists((previousLists) => {
            const remaining = previousLists.filter(
              (list) => list.id !== event.data.id,
            );

            remaining.splice(event.data.position, 0, event.data);

            return remaining.map((list, index) => ({
              ...list,
              position: index,
            }));
          });
          break;
        case "LIST_DELETED": // remove list
          setLists((prev) => prev.filter((d) => d.id !== event.data));
          break;

        default:
          break;
      }
    },
    [user?.id],
  );
  useBoardSocket(boardId ? Number(boardId) : undefined, handleBoardEvent);
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
      className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: boardBackground
          ? `url(${boardBackground})`
          : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
      }}
    >
      {/* Board Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-white drop-shadow-sm">
            Board #{boardId}
          </h1>
          <span className="text-white/30">|</span>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white/85 ring-1 ring-inset ring-white/15">
            {lists.length} list{lists.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-1 items-start gap-4 overflow-x-auto px-4 pb-6 pt-5 sm:px-6">
        {lists.map((list, listIndex) => (
          <Column
            key={list.id}
            list={list}
            listIndex={listIndex}
            cards={cards[list.id] ?? []}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onClickCard={setSelectedCard}
            onDeleteList={handleDeleteList}
            onRenameList={handleRenameList}
            onDragStartList={handleDragStartList}
            onDragEndList={handleDragEndList}
            isListDragging={isListDragging}
            onDropList={handleDropList}
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
            className="flex w-64 shrink-0 items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-[13px] font-medium text-white shadow-sm shadow-black/10 ring-1 ring-inset ring-white/20 backdrop-blur-md transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
          members={members}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={(cardId) => handleDeleteCard(cardId, selectedCard.listId)}
        />
      )}
    </div>
  );
};

export default Board;
