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
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: "OWNER" | "MEMBER";
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
  const [listsPage, setListsPage] = useState(0);
  const [listsHasMore, setListsHasMore] = useState(true);
  const [listsLoading, setListsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [top5MembersLoading, setTop5MembersLoading] = useState<boolean>(true);
  const [top5MembersAndTotalMembersCount, setTop5MembersAndTotalMembersCount] =
    useState<{ members: Member[]; totalMembers: number }>();
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(0);
  const [membersHasMore, setMembersHasMore] = useState(true);
  const membersBottomRef = useRef<HTMLDivElement | null>(null);
  const membersListRef = useRef<HTMLDivElement | null>(null);
  const listsBottomRef = useRef<HTMLDivElement | null>(null);
  // Drag state stored in a ref to avoid re-renders
  const dragCard = useRef<Card | null>(null);
  const dragListId = useRef<number | null>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  const fetchLists = useCallback(
    async (pageNumber: number) => {
      if (!numericBoardId) return;

      setListsLoading(true);
      try {
        const res = await axiosIns.get<{
          content: BoardList[];
          totalPages: number;
        }>(`${BASE}/list/${numericBoardId}`, {
          params: { page: pageNumber, size: 1 },
        });
        const pageLists = res.data.content;

        setLists((previous) =>
          pageNumber === 0 ? pageLists : [...previous, ...pageLists],
        );
        setListsPage(pageNumber);
        setListsHasMore(pageNumber + 1 < res.data.totalPages);

        const entries = await Promise.all(
          pageLists.map((list) =>
            axiosIns
              .get<Card[]>(`${BASE}/card/${list.id}`)
              .then((cardsRes) => [list.id, cardsRes.data] as [number, Card[]]),
          ),
        );
        setCards((previous) => ({
          ...previous,
          ...Object.fromEntries(entries),
        }));
      } catch {
        setError("Failed to load board lists. Please try again.");
      } finally {
        setListsLoading(false);
      }
    },
    [numericBoardId],
  );

  //Fetch board data and lists
  useEffect(() => {
    const fetchBoard = async () => {
      if (!numericBoardId) return;
      setLoading(true);
      setLists([]);
      setCards({});
      setListsPage(0);
      setListsHasMore(true);
      try {
        const boardRes = await axiosIns.get<{
          workspaceId: number;
          backgroundImage: string;
        }>(`/api/workspace/board/detail/${numericBoardId}`);
        setWorkspaceId(boardRes.data.workspaceId);
        setBoardBackground(boardRes.data.backgroundImage);
        await fetchLists(0);
      } catch {
        setError("Failed to load board. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [fetchLists, numericBoardId]);

  //Fetch lists page by page
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listsHasMore && !listsLoading) {
          fetchLists(listsPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (listsBottomRef.current) {
      observer.observe(listsBottomRef.current);
    }

    return () => observer.disconnect();
  }, [fetchLists, listsHasMore, listsLoading, listsPage]);

  // Fetch members page by page as the modal is scrolled.
  const fetchMembers = useCallback(
    async (pageNumber: number) => {
      if (!isMembersModalOpen || !workspaceId) return;

      setMembersLoading(true);

      try {
        const res = await axiosIns.get<{
          content: Member[];
          totalPages: number;
        }>(`/api/workspace/member/${workspaceId}`, {
          params: {
            page: pageNumber,
            size: 10,
          },
        });

        if (pageNumber === 0) {
          setMembers(res.data.content);
        } else {
          setMembers((prev) => [...prev, ...res.data.content]);
        }
        setMembersPage(pageNumber);
        setMembersHasMore(pageNumber + 1 < res.data.totalPages);
      } catch (err) {
        console.error("Unable to fetch workspace members:", err);
      } finally {
        setMembersLoading(false);
      }
    },
    [isMembersModalOpen, workspaceId],
  );

  //Fetch initial members
  useEffect(() => {
    if (!isMembersModalOpen) return;

    setMembers([]);
    setMembersPage(0);
    setMembersHasMore(true);
    fetchMembers(0);
  }, [fetchMembers, isMembersModalOpen]);

  //Pagination trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && membersHasMore && !membersLoading) {
          fetchMembers(membersPage + 1);
        }
      },
      {
        root: membersListRef.current,
        threshold: 0.1,
      },
    );

    if (membersBottomRef.current) {
      observer.observe(membersBottomRef.current);
    }

    return () => observer.disconnect();
  }, [fetchMembers, membersHasMore, membersLoading, membersPage]);
  //Fetch 5 members and total members count
  useEffect(() => {
    if (!workspaceId) return;
    const fetchTop5MembersAndTotalMembersCount = async () => {
      setLoading(true);
      try {
        const res = await axiosIns.get(
          `/api/workspace/member/${workspaceId}/summary`,
        );
        setTop5MembersAndTotalMembersCount(res.data);
      } catch (err) {
        console.error("Unable to fetch workspace members:", err);
      } finally {
        setTop5MembersLoading(false);
      }
    };
    fetchTop5MembersAndTotalMembersCount();
  }, [workspaceId]);

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

  //Rename list
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

  //Delete list
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

  //Move list
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

  //Drop list after moving
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

  //Add card
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

  const handleSaveCard = useCallback((updatedCard: Card) => {
    setCards((previous) => {
      const next = { ...previous };
      const currentList = next[updatedCard.listId] ?? [];
      next[updatedCard.listId] = currentList.map((card) =>
        card.id === updatedCard.id ? updatedCard : card,
      );
      return next;
    });
    setSelectedCard(null);
  }, []);

  //Function to delete card
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
    <div className="relative h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: boardBackground
            ? `url(${boardBackground})`
            : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
        }}
      />
      {/* Board content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Board Header */}
        <div className="flex  flex-col gap-3 border-b border-white/10 bg-black/25 px-3 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h1 className="truncate text-base font-semibold tracking-tight text-white drop-shadow-sm sm:text-lg">
              Board #{boardId}
            </h1>

            <span className="shrink-0 text-white/30">|</span>

            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/85 ring-1 ring-inset ring-white/15 sm:px-2.5 sm:py-0.5 sm:text-xs">
              {lists.length} list{lists.length !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMembersModalOpen(true)}
            className="group flex w-fit items-center gap-2 self-end rounded-full border border-white/15 bg-white/10 py-1 pl-1.5 pr-3 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/15 sm:self-auto"
            title={`${top5MembersAndTotalMembersCount?.totalMembers ?? 0} members`}
          >
            {top5MembersLoading ? (
              <>
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="h-6 w-6 animate-pulse rounded-full border-2 border-[#5146a5] bg-white/30 sm:h-8 sm:w-8"
                    />
                  ))}
                </div>
                <div className="h-3 w-16 animate-pulse rounded-full bg-white/30" />
              </>
            ) : (
              <>
                <div className="flex -space-x-2">
                  {top5MembersAndTotalMembersCount?.members
                    .slice(0, 5)
                    .map((member, index) =>
                      member.avatar ? (
                        <img
                          key={member.id}
                          src={member.avatar}
                          alt={member.name}
                          title={member.name}
                          className="relative h-6 w-6 rounded-full border-2 border-[#5146a5] object-cover transition-transform duration-200 hover:z-10 hover:scale-110 sm:h-8 sm:w-8"
                          style={{ zIndex: 5 - index }}
                        />
                      ) : (
                        <span
                          key={member.id}
                          title={member.name}
                          className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#5146a5] bg-gradient-to-br from-indigo-100 to-violet-200 text-[9px] font-bold text-indigo-700 transition-transform duration-200 hover:z-10 hover:scale-110 sm:h-8 sm:w-8 sm:text-xs"
                          style={{ zIndex: 5 - index }}
                        >
                          {member.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      ),
                    )}
                </div>

                <span className="whitespace-nowrap text-[11px] font-medium text-white/90 sm:text-xs">
                  {top5MembersAndTotalMembersCount?.totalMembers ?? 0}
                  <span className="ml-1 text-white/60">
                    {top5MembersAndTotalMembersCount?.totalMembers === 1
                      ? "Member"
                      : "Members"}
                  </span>
                </span>
              </>
            )}
          </button>
        </div>

        {/* Columns */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-4 sm:px-6 sm:pt-5">
          <div className="flex flex-wrap items-start gap-3 sm:gap-4">
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

            {listsHasMore && (
              <div
                ref={listsBottomRef}
                className="h-4 w-full shrink-0"
                aria-hidden="true"
              />
            )}
            {listsLoading && lists.length > 0 && (
              <div className="w-64 shrink-0 py-3 text-center text-sm text-white/75">
                Loading more lists...
              </div>
            )}

            {addingList ? (
              <AddListForm
                onClose={() => setAddingList(false)}
                onAdd={handleAddList}
              />
            ) : (
              <button
                type="button"
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
        </div>
        {/* Members modal */}
        {isMembersModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsMembersModalOpen(false);
              }
            }}
          >
            <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Workspace Members
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {top5MembersAndTotalMembersCount?.totalMembers ?? 0} members
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMembersModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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

              {/* Members */}
              <div ref={membersListRef} className="overflow-y-auto px-3 py-3">
                {membersLoading && members.length === 0 ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      >
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />

                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                          <div className="h-2.5 w-40 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-slate-500">No members found.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                      >
                        {/* Avatar */}
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                            {member.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}

                        {/* User details */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {member.name}
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                    {membersHasMore && (
                      <div
                        ref={membersBottomRef}
                        className="h-4"
                        aria-hidden="true"
                      />
                    )}
                    {membersLoading && members.length > 0 && (
                      <div className="px-3 py-3 text-center text-xs text-slate-400">
                        Loading more members...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          workspaceId={workspaceId}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={() =>
            handleDeleteCard(selectedCard.id, selectedCard.listId)
          }
        />
      )}
    </div>
  );
};

export default Board;
