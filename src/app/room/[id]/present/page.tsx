"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PresentationMode } from "@/components/PresentationMode";
import { getRoomOrFallback } from "@/lib/roomStorage";

export default function RoomPresentPage() {
  const params = useParams();
  const room = getRoomOrFallback(params.id as string);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 grid-bg">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="icon" asChild className="mb-6">
          <Link href={`/room/${room.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PresentationMode room={room} />
      </div>
    </div>
  );
}
