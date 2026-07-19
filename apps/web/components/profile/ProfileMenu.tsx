"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogOut, Medal, Star } from "lucide-react";
import type { CurrentUser } from "../../types/auth";

interface ProfileMenuProps {
  user: CurrentUser;
  logout: () => void;
}

export default function ProfileMenu({ user, logout }: ProfileMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Always start closed right when a user actually logs in
  useEffect(() => {
    setMenuOpen(false);
  }, [user.userId]);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // TODO: mock values — replace once a real scoring/ranking system exists
  const totalPoints = 2450;
  const rank = "Platinum";

  return (
    <div ref={menuRef} className="relative">
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
        <div className="absolute top-full right-0 mt-3 w-60 overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-b from-surface-raised to-hero-dark/95 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3.5 transition hover:bg-gold/5">
            <span className="font-display text-glow flex items-center gap-2.5 text-sm text-gold">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffde59]/10">
                <Star className="h-4 w-4 fill-[#ffde59] text-[#ffde59] drop-shadow-[0_0_8px_rgba(255,222,89,0.85)]" />
              </div>
              Score
            </span>
            <span className="font-display text-glow text-lg text-gold">
              {totalPoints.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-gold/10 px-4 py-3.5 transition hover:bg-gold/5">
            <span className="font-display text-glow flex items-center gap-2.5 text-sm text-gold">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                <Medal className="h-4 w-4 text-gold" />
              </div>
              Rank
            </span>
            <span className="font-display text-sm text-gold">{rank}</span>
          </div>

          <button
            onClick={logout}
            className="font-display text-glow flex w-full cursor-pointer items-center gap-2.5 border-t border-gold/10 px-4 py-3.5 text-left text-sm text-gold transition hover:bg-ember/10 hover:text-ember"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5">
              <LogOut className="h-4 w-4" />
            </div>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
