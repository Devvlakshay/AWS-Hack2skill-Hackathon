import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ClientProviders from "@/components/ClientProviders";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitView AI — Try Before You Buy",
  description:
    "AI-powered virtual try-on platform for Indian retail clothing. Try before you buy.",
  icons: {
    icon: "/fitview.png",
    shortcut: "/fitview.png",
    apple: "/fitview.png",
  },
  openGraph: {
    title: "FitView AI — Try Before You Buy",
    description: "AI-powered virtual try-on for Indian fashion. See any outfit on you in seconds.",
    images: [{ url: "/fitview.png", width: 1200, height: 630, alt: "FitView AI" }],
  },
};

function AnnouncementBar() {
  const text =
    "FREE SHIPPING OVER ₹999  •  AI TRY-ON NOW LIVE  •  NEW ARRIVALS WEEKLY  •  FREE SHIPPING OVER ₹999  •  AI TRY-ON NOW LIVE  •  NEW ARRIVALS WEEKLY  •  ";

  return (
    <div className="announcement-bar py-2 select-none" aria-label="Announcement">
      <div className="marquee-container">
        <div className="marquee-content" aria-hidden="true">
          <span className="px-4">{text}</span>
          <span className="px-4">{text}</span>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} font-sans`}
        style={{ backgroundColor: "var(--cream)", color: "var(--ink)" }}
      >
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen pb-16 sm:pb-0">
          {children}
        </main>
        <ClientProviders />
      </body>
    </html>
  );
}
