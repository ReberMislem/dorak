// ============================================
// دورك - useSocket Hook
// ============================================

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socket = io({
      path: "/api/socket",
    });

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket");
    });

    socketRef.current = socket;
    const timeout = window.setTimeout(() => {
      setSocketState(socket);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      if (socket) {
        socket.disconnect();
      }
      socketRef.current = null;
      setSocketState(null);
    };
  }, []);

  return {
    socket: socketState,
    isConnected,
  };
}
