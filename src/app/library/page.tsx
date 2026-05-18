"use client";

import { useMemo, useState } from "react";
import { filterLessons } from "@/lib/curriculum";
import { LessonCard } from "@/components/LessonCard";
import { useAppStore } from "@/store/appStore";
import { SUBJECTS } from "@/types/curriculum";
import { Input } from "@/components/ui/input";

export default function LibraryPage() {
  const t = useAppStore((s) => s.t);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState("all");

  const lessons = useMemo(
    () => filterLessons({ search, subject, level }),
    [search, subject, level]
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 grid-bg">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold gradient-text mb-2">{t.library}</h1>
        <p className="text-slate-400 mb-8">{t.builtInLessons}</p>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <Input
            placeholder={t.searchLessons}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:flex-1"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-11 rounded-xl border border-cyan-500/20 bg-slate-900/50 px-3 text-sm text-slate-200"
          >
            <option value="all">{t.allSubjects}</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {t.subjects[s]}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-11 rounded-xl border border-cyan-500/20 bg-slate-900/50 px-3 text-sm text-slate-200"
          >
            <option value="all">{t.allLevels}</option>
            {(Object.entries(t.levels) as [string, string][]).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
        {lessons.length === 0 && (
          <p className="text-center text-slate-500 py-12">No lessons match your filters.</p>
        )}
      </div>
    </div>
  );
}
