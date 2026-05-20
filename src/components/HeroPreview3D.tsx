"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HeroPreviewLoading } from "@/components/HeroPreviewLoading";

const PreviewCanvas = dynamic(() => import("./3d/HeroPreviewCanvas"), {
  ssr: false,
  loading: () => <HeroPreviewLoading />,
});

export function HeroPreview3D() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            Your Knowledge, Reimagined in 3D
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Floating concept nodes, glowing connections, and a central knowledge core —
            explore ideas the way your brain remembers them.
          </p>
        </div>
        <ErrorBoundary>
          <PreviewCanvas />
        </ErrorBoundary>
      </div>
    </section>
  );
}
