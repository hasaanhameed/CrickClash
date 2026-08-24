import { io, Socket } from "socket.io-client";

/**
 * Opens an authenticated socket. The token goes in the handshake rather than a
 * header — a socket only authenticates once, when it connects, so there is no
 * per-request header to attach it to the way `lib/api.ts` does for HTTP.
 */
export function createSocket(): Socket | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  return io(process.env.NEXT_PUBLIC_API_URL as string, {
    auth: { token },
    autoConnect: true,
  });
}
