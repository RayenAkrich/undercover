import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Undercover — Hidden Failures Intelligence",
  description: "Discover recurring behavioral failures in AI-agent traces."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
