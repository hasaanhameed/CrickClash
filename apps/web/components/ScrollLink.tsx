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
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
