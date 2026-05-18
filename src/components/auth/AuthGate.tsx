"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_ROOM_ID } from "@/lib/roomStorage";

interface AuthGateProps {
  children: React.ReactNode;
  allowDemo?: boolean;
}

export function AuthGate({ children, allowDemo = false }: AuthGateProps) {
  const { isLoggedIn, ready } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string | undefined;
  const isDemoRoom = allowDemo || roomId === DEMO_ROOM_ID;

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn && !isDemoRoom) {
      router.replace("/auth");
    }
  }, [ready, isLoggedIn, isDemoRoom, router]);

  if (!ready) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center grid-bg">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn && !isDemoRoom) {
    return null;
  }

  return <>{children}</>;
}
