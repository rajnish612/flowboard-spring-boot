import { useEffect } from "react";
import { Client } from "@stomp/stompjs";

export type NotificationSocketData = {
  id: number;
  recipientId: number;
  actorId: number;
  workspaceId?: number;
  boardId?: number;
  cardId?: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export const useNotificationSocket = (
  onNotification: (notification: NotificationSocketData) => void,
) => {
  useEffect(() => {
    const client = new Client({
      brokerURL: import.meta.env.VITE_NOTIFICATION_WS_URL,
      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe("/user/queue/notifications", (message) => {
          const notification: NotificationSocketData = JSON.parse(message.body);

          onNotification(notification);
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
  }, [onNotification]);
};
