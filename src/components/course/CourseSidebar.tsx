import { useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { flattenLessons } from "@/lib/courses/types";
import { useCourse } from "./CourseContext";

function snippet(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return null;
  const start = Math.max(0, i - 30);
  const clean = (s: string) => s.replace(/[#*`>_[\]]/g, "").replace(/\s+/g, " ");
  return {
    before: (start > 0 ? "…" : "") + clean(text.slice(start, i)),
    match: text.slice(i, i + q.length),
    after: clean(text.slice(i + q.length, i + q.length + 50)) + "…",
  };
}

export function CourseSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { course, done, toggle } = useCourse();
  const { lessonId } = useParams({ strict: false });
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const total = flattenLessons(course).length;
  const doneCount = flattenLessons(course).filter((l) => done.has(l.id)).length;

  const modules = useMemo(
    () =>
      course.modules
        .map((m) => ({
          ...m,
          lessons: m.lessons
            .map((l) => ({
              ...l,
              hit: q && !l.title.toLowerCase().includes(q) ? snippet(l.markdown, q) : null,
            }))
            .filter((l) => !q || l.title.toLowerCase().includes(q) || l.hit),
        }))
        .filter((m) => m.lessons.length),
    [course, q],
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pt-5 pb-4">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <ArrowLeft className="size-3.5" /> Все курсы
        </Link>
        <h2 className="font-display text-lg leading-tight text-sidebar-accent-foreground">
          {course.title}
        </h2>
        <div className="mt-4 flex justify-between text-xs text-sidebar-foreground/60">
          <span>Прогресс</span>
          <span className="tabular-nums">
            {doneCount} / {total}
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sidebar-border">
          <div
            className="h-full rounded-full bg-sidebar-primary transition-all"
            style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>
        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-sidebar-foreground/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по курсу"
            className="w-full rounded-md border border-sidebar-border bg-sidebar-accent/40 py-2 pr-3 pl-8 text-sm placeholder:text-sidebar-foreground/40 focus:border-sidebar-ring focus:outline-none"
          />
        </label>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {modules.length === 0 && (
          <p className="px-2 py-3 text-sm text-sidebar-foreground/60">Ничего не найдено</p>
        )}
        {modules.map((m) => (
          <div key={m.title} className="mb-4">
            <p className="px-2 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              {m.title}
            </p>
            {m.lessons.map((l) => {
              const isDone = done.has(l.id);
              const isActive = l.id === lessonId;
              return (
                <div key={l.id} className="group flex items-start gap-1">
                  <button
                    type="button"
                    onClick={() => toggle(l.id)}
                    aria-label={isDone ? "Снять отметку" : "Отметить пройденным"}
                    className={cn(
                      "mt-2 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                      isDone
                        ? "border-success bg-success text-success-foreground"
                        : "border-sidebar-foreground/30 text-transparent hover:border-sidebar-foreground/60",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </button>
                  <Link
                    to="/courses/$courseId/$lessonId"
                    params={{ courseId: course.id, lessonId: l.id }}
                    onClick={onNavigate}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-sm leading-snug transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50",
                    )}
                  >
                    <span className="mr-2 font-mono text-xs text-sidebar-primary tabular-nums">
                      {l.number}
                    </span>
                    {l.title}
                    {l.hit && (
                      <span className="mt-1 block text-xs text-sidebar-foreground/60">
                        {l.hit.before}
                        <mark className="rounded-sm bg-sidebar-primary/30 text-sidebar-accent-foreground">
                          {l.hit.match}
                        </mark>
                        {l.hit.after}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
