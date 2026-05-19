"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Globe,
  Compass,
  Map,
  Calculator,
  BookOpen,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/hooks/useAuth";
import { saveDemoRoom, DEMO_ROOM_ID } from "@/lib/roomStorage";
import dynamic from "next/dynamic";

const HeroPreview3D = dynamic(
  () => import("@/components/HeroPreview3D").then((m) => m.HeroPreview3D),
  { ssr: false }
);
import { Logo } from "@/components/Logo";

export function HeroSection() {
  const t = useAppStore((s) => s.t);
  const router = useRouter();
  const { isLoggedIn, ready } = useAuth();

  const features = [
    { icon: Map, title: t.features.room3d, desc: t.features.room3dDesc },
    { icon: Globe, title: t.features.multilingual, desc: t.features.multilingualDesc },
    { icon: Compass, title: t.features.forEveryone, desc: t.features.forEveryoneDesc },
    { icon: Calculator, title: t.features.math, desc: t.features.mathDesc },
    { icon: BookOpen, title: t.features.study, desc: t.features.studyDesc },
    { icon: Route, title: t.features.routes, desc: t.features.routesDesc },
  ];

  const enterPalace = () => {
    if (ready && isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  const launchDemo = () => {
    saveDemoRoom();
    router.push(`/room/${DEMO_ROOM_ID}`);
  };

  return (
    <section className="relative min-h-0 pt-20 pb-8 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden />
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-4xl mx-auto mb-8">
          <p className="inline-flex items-center justify-center rounded-full glass border border-cyan-500/30 bg-cyan-500/5 px-4 py-2 mb-5 text-xs sm:text-sm text-cyan-200/95 tracking-wide shadow-[0_0_28px_rgba(34,211,238,0.15)] backdrop-blur-md max-w-[95vw]">
            {t.tagline}
          </p>

          <div className="flex justify-center mb-4">
            <Logo variant="hero" href={null} priority />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3">
            <span className="gradient-text neon-text">MEMORY</span>
            <br />
            <span className="text-slate-100">PALACE</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
            {t.taglineSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={enterPalace}>
              {t.enterPalace}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex flex-col items-center gap-1.5">
              <Button size="lg" variant="outline" onClick={launchDemo}>
                <Brain className="h-5 w-5" />
                {t.launchDemo}
              </Button>
              <p className="text-xs text-slate-500">{t.demoHelper}</p>
            </div>
          </div>
        </div>

        <HeroPreview3D />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 max-w-5xl mx-auto">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass rounded-2xl p-5 hover:border-cyan-500/20 transition-colors"
            >
              <Icon className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-slate-100 mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
