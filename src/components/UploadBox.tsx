"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPT_FILE_INPUT,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  SUPPORTED_FORMATS_LABEL,
  getFileExtension,
  isPlainTextExtension,
} from "@/lib/file-types";

interface UploadBoxProps {
  onFileContent: (content: string, fileName: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function UploadBox({ onFileContent, onError, disabled }: UploadBoxProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setExtracting(true);
      setLocalError(null);

      try {
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(
            `File is too large. Maximum size is ${MAX_UPLOAD_MB}MB.`
          );
        }

        const ext = getFileExtension(file.name);
        let text: string;

        if (isPlainTextExtension(ext)) {
          text = await file.text();
        } else {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/extract-file", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to extract text from file");
          }
          text = data.text;
        }

        if (!text || text.trim().length < 20) {
          throw new Error(
            "Not enough readable text in this file. Try a different file or paste content below."
          );
        }

        setFileName(file.name);
        onFileContent(text, file.name);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to read file";
        setLocalError(message);
        onError?.(message);
        setFileName(null);
      } finally {
        setExtracting(false);
      }
    },
    [onFileContent, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (disabled || extracting) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, extracting, processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    setLocalError(null);
  };

  const busy = disabled || extracting;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-8 text-center transition-all",
          dragActive
            ? "border-cyan-400 bg-cyan-500/10 glow-cyan"
            : "border-slate-600 hover:border-cyan-500/40",
          busy && "opacity-60 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept={ACCEPT_FILE_INPUT}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={busy}
        />
        {extracting ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
            <p className="text-slate-200 font-medium">Extracting text from document...</p>
            <p className="text-sm text-slate-500">PDF, Word, PowerPoint, and more</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-cyan-400 shrink-0" />
            <div className="text-left min-w-0">
              <p className="font-medium text-slate-200 truncate">{fileName}</p>
              <p className="text-sm text-emerald-400/90">Text extracted — ready to process</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="ml-2 p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-cyan-400/70 mb-4" />
            <p className="text-slate-200 font-medium">
              Drop your document here or click to browse
            </p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              {SUPPORTED_FORMATS_LABEL}
            </p>
            <p className="text-xs text-slate-600 mt-2">Max file size: {MAX_UPLOAD_MB}MB</p>
          </>
        )}
      </div>
      {localError && (
        <p className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {localError}
        </p>
      )}
    </div>
  );
}
