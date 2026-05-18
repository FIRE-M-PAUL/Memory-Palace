"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/RoomCard";
import { LessonCard } from "@/components/LessonCard";
import { ProgressSummary } from "@/components/ProgressSummary";
import { EmptyState } from "@/components/EmptyState";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { LevelSelector } from "@/components/LevelSelector";
import { getRooms, saveDemoRoom, DEMO_ROOM_ID } from "@/lib/roomStorage";
import { BUILT_IN_LESSONS } from "@/lib/curriculum";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const t = useAppStore((s) => s.t);
  const level = useAppStore((s) => s.level);
  const [rooms, setRooms] = useState<ReturnType<typeof getRooms>>([]);
  const router = useRouter();

  useEffect(() => {
    setRooms(getRooms());
  }, []);

  const launchDemo = () => {
    saveDemoRoom();
    router.push(`/room/${DEMO_ROOM_ID}`);
  };

  const filteredLessons = level
    ? BUILT_IN_LESSONS.filter((l) => l.level === level).slice(0, 4)
    : BUILT_IN_LESSONS.slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 grid-bg">
      <OnboardingGuide />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl space-y-10"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t.welcome}</h1>
            <p className="text-slate-400 mt-1">{t.taglineSub}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LevelSelector />
            <Button variant="outline" onClick={launchDemo}>
              <Sparkles className="h-4 w-4" />
              {t.launchDemo}
            </Button>
            <Button asChild>
              <Link href="/create">
                <Plus className="h-4 w-4" />
                {t.createNew}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-200 mb-4">{t.savedRooms}</h2>
              {rooms.length === 0 ? (
                <EmptyState
                  icon={Brain}
                  title={t.noRooms}
                  description={t.noRoomsDesc}
                  actionLabel={t.createFirstRoom}
                  onAction={() => router.push("/create")}
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-200">{t.continueLearning}</h2>
                <Link href="/library" className="text-sm text-cyan-400 hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </section>
          </div>

          <ProgressSummary />
        </div>
      </motion.div>
    </div>
  );
}
