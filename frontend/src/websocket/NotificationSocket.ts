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
      // Notification Service WebSocket endpoint.
      brokerURL: "ws://localhost:8084/ws",

      // Reconnect automatically if the connection drops.
      reconnectDelay: 5000,

      onConnect: () => {
        // Subscribe to the currently authenticated user's
        // private notification destination.
        client.subscribe("/user/queue/notifications", (message) => {
          const notification: NotificationSocketData = JSON.parse(message.body);

          onNotification(notification);
        });
      },

      onStompError: (frame) => {
        console.error("Notification STOMP error:", frame);
      },

      onWebSocketError: (error) => {
        console.error("Notification WebSocket error:", error);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [onNotification]);
};
