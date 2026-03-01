import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import BottomTabBar from "@/components/BottomTabBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitView AI - Virtual Try-On Platform",
  description:
    "AI-powered virtual try-on platform for Indian retail clothing. Try before you buy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen pb-20 sm:pb-0">{children}</main>
          <BottomTabBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
