// ============================================
// دورك - Real-time Socket Service
// ============================================

import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { WS_EVENTS } from "@/constants";

export const initSocketServer = (server: NetServer) => {
  const io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join room for a specific queue
    socket.on(WS_EVENTS.JOIN_QUEUE_ROOM, (queueId: string) => {
      socket.join(`queue:${queueId}`);
      console.log(`Socket ${socket.id} joined queue room: ${queueId}`);
    });

    // Join room for a specific shop
    socket.on(WS_EVENTS.JOIN_SHOP_ROOM, (shopId: string) => {
      socket.join(`shop:${shopId}`);
      console.log(`Socket ${socket.id} joined shop room: ${shopId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
