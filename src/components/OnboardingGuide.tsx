"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  hasCompletedOnboarding,
  setOnboardingComplete,
} from "@/lib/progressStorage";
import { useAppStore } from "@/store/appStore";

export function OnboardingGuide() {
  const t = useAppStore((s) => s.t);
  const [open, setOpen] = useState(() =>
    typeof window !== "undefined" ? !hasCompletedOnboarding() : false
  );

  if (!open) return null;

  const steps = [
    t.onboardingStep1,
    t.onboardingStep2,
    t.onboardingStep3,
    t.onboardingStep4,
    t.onboardingStep5,
  ];

  const finish = () => {
    setOnboardingComplete();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="glass-strong rounded-2xl p-6 sm:p-8 max-w-md w-full border border-cyan-500/20 shadow-xl"
        role="dialog"
        aria-labelledby="onboarding-title"
      >
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <h2 id="onboarding-title" className="text-xl font-bold text-center gradient-text mb-4">
          {t.onboardingTitle}
        </h2>
        <ol className="space-y-3 mb-6">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-slate-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={finish}>
            {t.onboardingCta}
          </Button>
          <Button variant="ghost" className="w-full text-slate-400" onClick={finish}>
            {t.onboardingSkip}
          </Button>
        </div>
      </div>
    </div>
  );
}
