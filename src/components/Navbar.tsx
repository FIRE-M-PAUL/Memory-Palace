"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Library,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/hooks/useAuth";
import { saveDemoRoom, DEMO_ROOM_ID } from "@/lib/roomStorage";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === "/";
  const isAuthPage = pathname === "/auth";
  const t = useAppStore((s) => s.t);
  const { isLoggedIn, ready, logout } = useAuth();

  const authLinks = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/library", label: t.library, icon: Library },
    { href: "/create", label: t.create, icon: Plus },
    { href: "/settings", label: t.settings, icon: Settings },
  ];

  const launchDemo = () => {
    saveDemoRoom();
    router.push(`/room/${DEMO_ROOM_ID}`);
  };

  const showPublicNav = ready && !isLoggedIn;
  const showAuthNav = ready && isLoggedIn;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/10",
        isLanding || isAuthPage ? "bg-slate-950/50 backdrop-blur-md" : "glass-strong"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <Logo variant="icon" priority />
          <Link href="/" className="font-bold tracking-wider text-sm hidden sm:inline truncate">
            <span className="gradient-text">MEMORY</span>{" "}
            <span className="text-slate-300">PALACE</span>
          </Link>
        </div>

        {showAuthNav && (
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-xl">
            {authLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  pathname.startsWith(href)
                    ? "text-cyan-300 bg-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showPublicNav && (
            <Button size="sm" asChild className="shrink-0">
              <Link href="/auth">
                <span className="hidden min-[400px]:inline">{t.enterPalace}</span>
                <span className="min-[400px]:hidden">Enter</span>
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            variant={showPublicNav ? "outline" : "secondary"}
            onClick={launchDemo}
            className="shrink-0"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">{t.launchDemo}</span>
          </Button>

          <LanguageSelector className="w-[110px] sm:w-[130px]" />

          {showAuthNav && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden sm:flex shrink-0"
              >
                <LogOut className="h-4 w-4" />
                {t.logout}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="sm:hidden shrink-0"
                aria-label={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
