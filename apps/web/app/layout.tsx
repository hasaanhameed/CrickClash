import type { Metadata } from "next";
import { Russo_One, Rubik } from "next/font/google";
import "./globals.css";

const russoOne = Russo_One({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrickClash — Pakistan Cricket Quiz Arena",
  description:
    "Real-time Pakistan cricket trivia battles. Face off 1v1, chase daily streaks, and climb the leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${russoOne.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
