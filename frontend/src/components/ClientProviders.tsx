"use client";

import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";

const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });

export default function ClientProviders() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(30, 27, 75, 0.95)",
            color: "#e0e0ff",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            backdropFilter: "blur(12px)",
          },
          duration: 3000,
        }}
      />
      <ChatBot />
    </>
  );
}
