"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

interface LogoProps {
  /** icon = navbar; hero = landing preview; full = auth / marketing */
  variant?: "icon" | "hero" | "full";
  className?: string;
  href?: string | null;
  priority?: boolean;
}

export function Logo({ variant = "icon", className, href, priority = false }: LogoProps) {
  const image =
    variant === "icon" ? (
      <Image
        src={LOGO_SRC}
        alt="MEMORY PALACE"
        width={40}
        height={40}
        priority={priority}
        className={cn(
          "h-9 w-9 rounded-lg object-cover object-[center_12%] ring-1 ring-cyan-500/30",
          className
        )}
      />
    ) : variant === "hero" ? (
      <Image
        src={LOGO_SRC}
        alt="MEMORY PALACE"
        width={360}
        height={280}
        priority={priority}
        className={cn(
          "w-[170px] sm:w-[230px] md:w-[300px] lg:w-[340px] xl:w-[360px] max-h-[220px] sm:max-h-[240px] md:max-h-[260px] lg:max-h-[280px] object-contain object-top drop-shadow-[0_0_28px_rgba(34,211,238,0.2)]",
          className
        )}
      />
    ) : (
      <Image
        src={LOGO_SRC}
        alt="MEMORY PALACE — Turn your notes into a living memory world"
        width={480}
        height={480}
        priority={priority}
        className={cn(
          "w-full max-w-[min(100%,280px)] h-auto object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.25)]",
          className
        )}
      />
    );

  if (href != null) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 rounded-lg"
      >
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{image}</span>;
}
