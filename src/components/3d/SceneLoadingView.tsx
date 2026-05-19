"use client";

export function SceneLoadingView({ label = "Loading learning world…" }: { label?: string }) {
  return (
    <div className="h-full min-h-[380px] rounded-2xl glass flex items-center justify-center border border-cyan-500/10">
      <p className="text-cyan-400/90 text-sm animate-pulse">{label}</p>
    </div>
  );
}
