import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

export type NotificationSocketData = {
  id: number;
  recipientId: number;
  actorId: number;
  actorName: string | null;
  actorAvatar: string | null;
  workspaceId: number | null;
  workspaceName: string | null;
  boardId: number | null;
  boardName: string | null;
  cardId: number | null;
  cardTitle: string | null;
  type:
    | "CARD_CREATED"
    | "CARD_UPDATED"
    | "CARD_MOVED"
    | "CARD_DELETED"
    | "CARD_ASSIGNED"
    | "CARD_UNASSIGNED"
    | "CARD_DUE_SOON"
    | "CARD_DUE"
    | "LIST_CREATED"
    | "LIST_UPDATED"
    | "LIST_MOVED"
    | "LIST_DELETED";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export const useNotificationSocket = (
  onNotification: (notification: NotificationSocketData) => void,
  enabled = true,
) => {
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const client = new Client({
      brokerURL: import.meta.env.VITE_NOTIFICATION_WS_URL,
      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe("/user/queue/notifications", (message) => {
          const notification: NotificationSocketData = JSON.parse(message.body);

          onNotificationRef.current(notification);
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
  }, [enabled]);
};
