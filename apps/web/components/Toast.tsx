"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="animate-toast-in fixed top-6 left-1/2 z-[60] -translate-x-1/2">
      <div className="btn-gold font-display rounded-md px-6 py-3 text-base whitespace-nowrap text-foreground shadow-2xl">
        <span className="text-glow relative z-10">{message}</span>
      </div>
    </div>
  );
}
