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
      className={`flex flex-col w-64 shrink-0 rounded-2xl shadow-sm transition-colors ${
        dragOver ? "bg-indigo-50/80 ring-2 ring-indigo-300" : "bg-gray-100/80"
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
        className="flex items-center justify-between px-3 pt-3 pb-2 cursor-grab active:cursor-grabbing"
      >
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
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5 font-medium shrink-0">
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
    const fetchAllCards = async () => {
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
    fetchAllCards();
  }, [numericBoardId, boardId]);

  // ── List actions ────────────────────────────────────────────────────────────
  const handleAddList = useCallback(
    async (name: string) => {
      const res = await axiosIns.post<BoardList>(`${BASE}/list/create`, {
        boardId: numericBoardId,
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

  const handleDeleteList = useCallback(
    async (listId: number) => {
      await axiosIns.delete(`${BASE}/list/${listId}/${numericBoardId}`);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setCards((prev) => {
        const next = { ...prev };
        delete next[listId];
        return next;
      });
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
      const res = await axiosIns.post<Card>(`${BASE}/card/create/${boardId}`, {
        listId,
        title,
      });
      const newCard = res.data;
      // const newCard = await api.createCard(listId, title);
      setCards((prev) => ({
        ...prev,
        [listId]: [...(prev[listId] ?? []), newCard],
      }));
    },
    [boardId],
  );

  const handleDeleteCard = useCallback(
    async (cardId: number, listId: number) => {
      await axiosIns.delete(`${BASE}/card/${cardId}/${boardId}`);
      setCards((prev) => ({
        ...prev,
        [listId]: (prev[listId] ?? []).filter((c) => c.id !== cardId),
      }));
      setSelectedCard(null);
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
        .post<Card>(`${BASE}/card/${card.id}/move/${boardId}`, {
          targetListId,
          position: targetPosition,
        })
        .then((r) => r.data);
    },
    [boardId],
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
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: boardBackground
          ? `url(${boardBackground})`
          : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
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
            className="flex items-center gap-2 w-64 shrink-0 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors backdrop-blur-sm"
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
