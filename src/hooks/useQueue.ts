// ============================================
// دورك - useQueue Hook
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/constants";
import { useSocket } from "./useSocket";

type QueueData = {
  id: string;
  name: string;
  nameAr?: string | null;
  status: string;
  currentNumber?: number | null;
  waitingCount?: number;
  estimatedWait?: number | null;
};

export function useQueue(queueId: string) {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  const fetchQueue = useCallback(async () => {
    try {
      const res = await axios.get(`${API.QUEUES}/${queueId}/status`);
      if (res.data.success) {
        setQueueData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  }, [queueId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchQueue();
    }, 0);

    if (socket) {
      socket.emit("join:queue", queueId);

      socket.on("ticket:created", () => fetchQueue());
      socket.on("ticket:called", () => fetchQueue());
      socket.on("queue:status", () => fetchQueue());
      socket.on("position:updated", () => fetchQueue());
    }

    return () => {
      if (socket) {
        socket.off("ticket:created");
        socket.off("ticket:called");
        socket.off("queue:status");
        socket.off("position:updated");
      }
      window.clearTimeout(timeout);
    };
  }, [queueId, socket, fetchQueue]);

  return {
    queueData,
    isLoading,
    refresh: fetchQueue,
  };
}
