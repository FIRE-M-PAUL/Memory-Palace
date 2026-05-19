import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { AppProvider } from "@/components/providers/AppProvider";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MEMORY PALACE | Multilingual Spatial Learning",
  description:
    "Turn your notes into a living memory world. A visual learning platform for learners, thinkers, and explorers.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-slate-950 text-slate-100 min-h-screen`}
        suppressHydrationWarning
      >
        <AppProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
