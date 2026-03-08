import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GridSense — AI Traffic Command Center",
  description: "Real-time AI-powered traffic signal optimization with emergency override",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative z-10">{children}</body>
    </html>
  );
}
