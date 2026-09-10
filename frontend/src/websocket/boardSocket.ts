import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import type { BoardList, Card } from "../types/task";

type CardEvent =
  | {
      userId: number;
      type: "CARD_CREATED" | "CARD_UPDATED" | "CARD_MOVED";
      boardId: number;
      data: Card;
    }
  | {
      userId: number;
      type: "CARD_DELETED";
      boardId: number;
      data: number;
    };

type ListEvent =
  | {
      userId: number;
      type: "LIST_CREATED" | "LIST_UPDATED";
      boardId: number;
      data: BoardList;
    }
  | {
      userId: number;
      type: "LIST_DELETED";
      boardId: number;
      data: number;
    };

export type BoardSocketEvent = CardEvent | ListEvent;
//Type declaration for the board socket event

export const useBoardSocket = (
  boardId: number | undefined,
  onEvent: (event: BoardSocketEvent) => void,
) => {
  useEffect(() => {
    if (!boardId) {
      return;
    }

    const client = new Client({
      brokerURL: "ws://localhost:8083/ws",
      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe(`/topic/board/${boardId}`, (message) => {
          const event: BoardSocketEvent = JSON.parse(message.body);

          onEvent(event);
        });
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [boardId, onEvent]);
};
