"use client";

import { useState } from "react";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to the /auth/register and /auth/login API endpoints
    console.log(mode, { username, password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* blurred backdrop */}
      <div
        className="absolute inset-0 bg-hero-dark/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm rounded-xl border border-gold/30 bg-surface-raised p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-foreground/60 transition hover:text-foreground"
        >
          ✕
        </button>

        <h2 className="font-display text-glow text-2xl text-foreground">
          {mode === "register" ? "JOIN THE CLASH" : "WELCOME BACK"}
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          {mode === "register"
            ? "Pick a username and password to start playing."
            : "Log back in to keep your streak alive."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-foreground/70">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-md border border-foreground/15 bg-hero-dark/40 px-4 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-foreground/15 bg-hero-dark/40 px-4 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>

          <button
            type="submit"
            className="btn-game btn-gold font-display mt-2 rounded-md px-6 py-3 text-lg text-foreground"
          >
            <span className="text-glow relative z-10">
              {mode === "register" ? "Get Started" : "Dive Back Into Action"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
