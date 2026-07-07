"use client";

import { MouseEvent, ReactNode } from "react";

interface ScrollLinkProps {
  targetId: string;
  className?: string;
  children: ReactNode;
}

export default function ScrollLink({
  targetId,
  className,
  children,
}: ScrollLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const startY = window.scrollY;
    const endY = target.getBoundingClientRect().top + startY;
    const duration = 700;
    const startTime = performance.now();

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + (endY - startY) * easeInOutQuad(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
