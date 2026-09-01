// Shared TypeScript types matching taskservice backend DTOs

export type BoardList = {
  id: number;
  boardId: number;
  name: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Card = {
  id: number;
  listId: number;
  title: string;
  description?: string;
  position: number;
  assignedTo?: number;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};
