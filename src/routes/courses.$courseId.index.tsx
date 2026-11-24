import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { useCourse } from "@/components/course/CourseContext";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
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

      {course.modules.length === 0 ? (
        <Empty className="mt-10 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>{t.courseNoModules}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="mt-10 flex flex-col gap-3">
          {course.modules.map((module, index) => (
            <li key={module.id}>
              <Item
                asChild
                variant="outline"
                className="flex-nowrap items-start gap-4 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary sm:gap-6 sm:p-6 [a]:hover:bg-card"
              >
                <Link
                  to="/courses/$courseId/modules/$moduleId"
                  params={{ courseId: course.id, moduleId: module.id }}
                >
                  <ItemMedia>
                    {module.badgeColor ? (
                      <span
                        className="grid size-12 place-items-center rounded-full font-mono text-sm font-bold text-white shadow-sm sm:size-14"
                        style={{ backgroundColor: module.badgeColor }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    ) : (
                      <span className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-sm font-semibold text-primary sm:size-14">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </ItemMedia>
                  <ItemContent className="min-w-0 gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {t.moduleListItem(index + 1, module.lessons.length)}
                    </span>
                    <ItemTitle className="w-auto font-display text-xl leading-snug font-medium group-hover/item:text-primary sm:text-2xl">
                      {module.title}
                    </ItemTitle>
                    <ItemDescription className="line-clamp-3 text-pretty leading-relaxed">
                      {getSummary(
                        module.pageMarkdown,
                        module.lessons.map((lesson) => lesson.title),
                      )}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="pt-1">
                    <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover/item:translate-x-1 group-hover/item:text-primary" />
                  </ItemActions>
                </Link>
              </Item>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="size-4" /> {t.moduleChoose}
      </p>
    </main>
  );
}
