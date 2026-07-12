"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "./AuthModal";
import Toast from "../Toast";

const successMessages: Record<"login" | "register", string> = {
  register: "You're in! Let's clash. 🏏",
  login: "Welcome back — dive into the action!",
};

export default function AuthButtons() {
  const { user, isLoadingUser, logout } = useAuth();
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSuccess = () => {
    if (modal) {
      setToast(successMessages[modal]);
    }
    setModal(null);
  };

  // Avoid flashing "Log in / Register" for a split second while we
  // check whether a saved token actually belongs to a real user.
  if (isLoadingUser) {
    return <div className="h-11 w-40" />;
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex cursor-pointer items-center gap-3 border-b-2 border-transparent py-1 transition hover:border-gold/50"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src="/images/helmet.png"
              alt=""
              fill
              className="object-contain p-1 drop-shadow-[0_0_10px_rgba(232,181,58,0.8)]"
            />
          </div>
          <span className="font-display text-glow text-xl text-gold">
            {user.username}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 overflow-hidden rounded-md border border-gold/25 bg-surface-raised shadow-2xl">
            <button
              onClick={logout}
              className="w-full cursor-pointer px-4 py-3 text-left text-sm text-foreground/80 transition hover:bg-hero-dark/50 hover:text-gold"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setModal("login")}
          className="btn-game cursor-pointer rounded-lg px-4 py-2 text-lg font-semibold text-foreground/90 hover:text-gold"
        >
          Log in
        </button>
        <button
          onClick={() => setModal("register")}
          className="btn-game btn-gold font-display cursor-pointer rounded-md px-7 py-3 text-lg text-foreground"
        >
          <span className="text-glow relative z-10">Register</span>
        </button>
      </div>

      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
