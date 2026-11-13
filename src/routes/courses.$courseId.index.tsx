import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { useCourse } from "@/components/course/CourseContext";
import { useI18n } from "@/lib/locale";

export const Route = createFileRoute("/courses/$courseId/")({
  component: CourseModules,
});

function getSummary(markdown: string, lessonTitles: string[]) {
  const paragraphs = markdown
    .replace(/^#+ .*$/gm, "")
    .replace(/^!\[.*\]\(.*\)$/gm, "")
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_>#]/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);

  const summary = paragraphs[0]
    ? paragraphs[0]
    : lessonTitles.length === 0
      ? "Материалы модуля скоро появятся."
      : "Темы модуля: " +
        lessonTitles.slice(0, 3).join(", ") +
        (lessonTitles.length > 3 ? " и другие" : "") +
        ".";
  return summary.length > 190 ? summary.slice(0, 187).trimEnd() + "…" : summary;
}

function CourseModules() {
  const { course } = useCourse();
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-4xl px-5 pt-16 pb-24 sm:px-10 lg:pt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {t.courseProgram}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{course.title}</h1>
      {course.description && (
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {course.description}
        </p>
      )}

      <div className="mt-10 border-y border-border">
        {course.modules.length === 0 ? (
          <p className="py-8 text-muted-foreground">{t.courseNoModules}</p>
        ) : (
          course.modules.map((module, index) => (
            <Link
              key={module.id}
              to="/courses/$courseId/modules/$moduleId"
              params={{ courseId: course.id, moduleId: module.id }}
              className="group flex gap-4 border-b border-border py-5 last:border-b-0 sm:gap-6 sm:py-6"
            >
              {module.badgeColor ? (
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-white shadow-sm sm:size-14"
                  style={{ backgroundColor: module.badgeColor }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : (
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-sm font-semibold text-primary sm:size-14">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t.moduleListItem(index + 1, module.lessons.length)}
                </span>
                <span className="block font-display text-xl leading-snug text-foreground group-hover:text-primary sm:text-2xl">
                  {module.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  {getSummary(
                    module.pageMarkdown,
                    module.lessons.map((lesson) => lesson.title),
                  )}
                </span>
              </span>
              <ArrowRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))
        )}
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="size-4" /> {t.moduleChoose}
      </p>
    </main>
  );
}
