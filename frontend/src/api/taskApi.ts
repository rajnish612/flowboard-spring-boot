import { axiosIns } from "../utils/axiosInstance";
import type { BoardList, Card } from "../types/task";

const BASE = "/api/task";

// ─── BoardList endpoints ───────────────────────────────────────────────────

export const fetchLists = (boardId: number) =>
  axiosIns.get<BoardList[]>(`${BASE}/list/${boardId}`).then((r) => r.data);

export const createList = (boardId: number, name: string) =>
  axiosIns
    .post<BoardList>(`${BASE}/list/create`, { boardId, name })
    .then((r) => r.data);

export const updateList = (id: number, name: string) =>
  axiosIns
    .put<BoardList>(`${BASE}/list/${id}`, { name })
    .then((r) => r.data);

export const deleteList = (id: number) =>
  axiosIns.delete(`${BASE}/list/${id}`);

export const reorderList = (id: number, position: number) =>
  axiosIns
    .patch<BoardList>(`${BASE}/list/${id}/reorder`, { position })
    .then((r) => r.data);

// ─── Card endpoints ────────────────────────────────────────────────────────

export const fetchCards = (listId: number) =>
  axiosIns.get<Card[]>(`${BASE}/card/${listId}`).then((r) => r.data);

export const createCard = (listId: number, title: string) =>
  axiosIns
    .post<Card>(`${BASE}/card/create`, { listId, title })
    .then((r) => r.data);

export const updateCard = (id: number, patch: Partial<Card>) =>
  axiosIns.put<Card>(`${BASE}/card/${id}`, patch).then((r) => r.data);

export const deleteCard = (id: number) =>
  axiosIns.delete(`${BASE}/card/${id}`);

export const moveCard = (
  cardId: number,
  targetListId: number,
  position: number
) =>
  axiosIns
    .patch<Card>(`${BASE}/card/${cardId}/move`, { targetListId, position })
    .then((r) => r.data);
