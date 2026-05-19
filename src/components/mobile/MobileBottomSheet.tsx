"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Full-width bottom sheet for detail panels on small screens */
export function MobileBottomSheet({
  open,
  onClose,
  title,
  children,
}: MobileBottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[min(85vh,640px)] flex flex-col rounded-t-2xl border border-cyan-500/20 bg-slate-950/95 shadow-2xl">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-600 shrink-0" />
        {title && (
          <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100 truncate">{title}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
