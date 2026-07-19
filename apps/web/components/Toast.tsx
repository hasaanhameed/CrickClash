"use client";

import { useEffect, useRef, useState } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
}

const DISPLAY_MS = 2800;
const EXIT_MS = 250;

export default function Toast({ message, onDone }: ToastProps) {
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // After the display window, start the exit animation
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Only actually unmount (via onDone) once the exit animation finishes
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => onDoneRef.current(), EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  return (
    // Horizontal centering lives here, on a wrapper that never animates —
    // keeps it completely separate from the in/out animation below.
    <div
      className="fixed top-6 left-1/2 z-[60]"
      style={{ transform: "translateX(-50%)" }}
    >
      <div className={leaving ? "animate-toast-out" : "animate-toast-in"}>
        <div className="btn-gold font-display min-w-xl rounded-md px-10 py-5 text-center text-lg whitespace-nowrap text-foreground shadow-2xl">
          <span className="text-glow relative z-10">{message}</span>
        </div>
      </div>
    </div>
  );
}
