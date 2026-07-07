"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";
import Toast from "../Toast";

const successMessages: Record<"login" | "register", string> = {
  register: "You're in! Let's clash. 🏏",
  login: "Welcome back — dive into the action!",
};

export default function AuthButtons() {
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSuccess = () => {
    if (modal) {
      setToast(successMessages[modal]);
    }
    setModal(null);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setModal("login")}
          className="btn-game rounded-lg px-4 py-2 text-lg font-semibold text-foreground/90 hover:text-gold"
        >
          Log in
        </button>
        <button
          onClick={() => setModal("register")}
          className="btn-game btn-gold font-display rounded-md px-7 py-3 text-lg text-foreground"
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
