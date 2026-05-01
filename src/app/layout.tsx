import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "./app-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViralStudio AI — AI Content Generation Platform",
  description: "Create stunning videos, images, avatars, and audio content with AI. Zero editing skills required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-[#0A0A0A] text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
