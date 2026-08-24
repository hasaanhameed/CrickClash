"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../lib/socket";
import {
  AlreadyEngagedPayload,
  MatchSummary,
  QueueEvent,
  QueueStatus,
} from "../types/quizPackMatch";

/**
 * Drives the "find me an opponent" search for one quiz pack: opens the socket
 * on demand, reports where the search has got to, and ticks the elapsed timer.
 */
export function useMatchQueue(packSlug: string) {
  const [status, setStatus] = useState<QueueStatus>({ phase: "idle" });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const startedAtRef = useRef(0);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  // Leaving the page mid-search should drop the socket, which the server
  // treats as leaving the queue.
  useEffect(() => disconnect, [disconnect]);

  // Ticks only while searching. The start time is stamped in `search` rather
  // than here, so the counter is already zeroed before the first render.
  useEffect(() => {
    if (status.phase !== "searching") return;

    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [status.phase]);

  const search = useCallback(() => {
    const socket = createSocket();
    if (!socket) {
      setStatus({ phase: "error", message: "Log in to enter the arena." });
      return;
    }

    socketRef.current = socket;
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setStatus({ phase: "searching" });

    socket.on(QueueEvent.Waiting, () => setStatus({ phase: "searching" }));

    socket.on(QueueEvent.Matched, (match: MatchSummary) => {
      setStatus({ phase: "matched", match });
      disconnect();
    });

    socket.on(QueueEvent.TimedOut, () => {
      setStatus({ phase: "timed-out" });
      disconnect();
    });

    socket.on(QueueEvent.AlreadyEngaged, (payload: AlreadyEngagedPayload) => {
      setStatus({ phase: "already-engaged", packTitle: payload.packTitle });
      disconnect();
    });

    socket.on(QueueEvent.Error, (payload: { message: string }) => {
      setStatus({ phase: "error", message: payload.message });
      disconnect();
    });

    socket.on("connect_error", () => {
      setStatus({ phase: "error", message: "Could not reach the arena." });
      disconnect();
    });

    socket.emit(QueueEvent.Join, { packSlug });
  }, [packSlug, disconnect]);

  const cancel = useCallback(() => {
    socketRef.current?.emit(QueueEvent.Cancel);
    disconnect();
    setStatus({ phase: "idle" });
  }, [disconnect]);

  const reset = useCallback(() => setStatus({ phase: "idle" }), []);

  return { status, elapsedSeconds, search, cancel, reset };
}
