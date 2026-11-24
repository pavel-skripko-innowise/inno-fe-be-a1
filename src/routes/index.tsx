import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Check, FileText, FolderOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { pickContinueLesson } from "@/lib/courses/continue";
import { catalogQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { readLastLessons, useDoneByCourse } from "@/lib/courses/progress";
import { mapCoursesToSections } from "@/lib/courses/sections";
import type { CourseSummary } from "@/lib/courses/types";
import { messagesFor } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const locale = await resolveLocale(context.queryClient);
    await context.queryClient.ensureQueryData(catalogQuery(locale));
    return { locale, lastLessons: readLastLessons() };
  },
  head: ({ loaderData }) => {
    const t = messagesFor(loaderData?.locale ?? "ru");
    return {
      meta: [
        { title: t.catalogTitle },
        { name: "description", content: t.catalogDescription },
        { property: "og:title", content: t.catalogTitle },
        { property: "og:description", content: t.catalogDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Catalog,
});

const NONE = new Set<string>();

function Catalog() {
  const { locale, t } = useI18n();
  const { lastLessons } = Route.useLoaderData();
  const { data } = useSuspenseQuery(catalogQuery(locale));
  const sections = mapCoursesToSections(data.sections, data.courses);
  const doneByCourse = useDoneByCourse(data.courses.map((course) => course.id));
  const lastByCourse = new Map(lastLessons.map((entry) => [entry.courseId, entry.lessonId]));
  const recent = lastLessons
    .map((entry) => data.courses.find((course) => course.id === entry.courseId))
    .find((course) => course !== undefined);
  const [emptyBefore, emptyAfter] = t.catalogEmpty.split("config.json");

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {t.catalogEyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-tight">{t.catalogTitle}</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">{t.catalogLead}</p>

      {recent && (
        <ContinueCard
          course={recent}
          lastLessonId={lastByCourse.get(recent.id)}
          done={doneByCourse[recent.id] ?? NONE}
        />
      )}

      {sections.length === 0 ? (
        <Empty className="mt-12 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>{t.catalogTitle}</EmptyTitle>
            <EmptyDescription>
              {emptyBefore}
              <code className="font-mono">config.json</code>
              {emptyAfter}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-14 space-y-16">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-display text-3xl leading-tight">{section.title}</h2>
              {section.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">{section.description}</p>
              )}
              {section.courses.length === 0 ? (
                <Empty className="mt-6 border p-6 md:p-6">
                  <EmptyDescription>{t.sectionEmpty}</EmptyDescription>
                </Empty>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {section.courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      lastLessonId={lastByCourse.get(course.id)}
                      done={doneByCourse[course.id] ?? NONE}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

type CardProps = {
  course: CourseSummary;
  lastLessonId: string | undefined;
  done: Set<string>;
};

function ContinueCard({ course, lastLessonId, done }: CardProps) {
  const { t } = useI18n();
  const lesson = pickContinueLesson(course.lessons, lastLessonId, done);
  if (!lesson) return null;
  const doneCount = course.lessons.filter((l) => done.has(l.id)).length;

  return (
    <section aria-labelledby="continue-learning" className="mt-10">
      <Link
        to="/courses/$courseId/$lessonId"
        params={{ courseId: course.id, lessonId: lesson.id }}
        className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="flex flex-col gap-6 border-primary/30 bg-primary/5 p-6 shadow-card transition-all group-hover:-translate-y-0.5 group-hover:border-primary sm:flex-row sm:items-center sm:p-7">
          <div className="min-w-0 flex-1">
            <p
              id="continue-learning"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
            >
              {t.continueLearning}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{course.title}</p>
            <p className="mt-1 font-display text-2xl leading-snug sm:text-3xl">
              <span className="mr-2.5 font-mono text-lg text-primary sm:text-xl">
                {lesson.number}
              </span>
              {lesson.title}
            </p>
            <div className="mt-4 flex max-w-md items-center gap-3">
              <Progress
                value={course.lessons.length ? (doneCount / course.lessons.length) * 100 : 0}
                aria-hidden
                className="h-1.5"
              />
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {t.lessonsDone(doneCount, course.lessons.length)}
              </span>
            </div>
          </div>
          <span
            className={buttonVariants({
              size: "lg",
              className: "shrink-0 self-start sm:self-auto",
            })}
          >
            {t.continueAction} <ArrowRight />
          </span>
        </Card>
      </Link>
    </section>
  );
}

function CourseCard({ course, lastLessonId, done }: CardProps) {
  const { t } = useI18n();
  const total = course.lessons.length;
  const doneCount = course.lessons.filter((l) => done.has(l.id)).length;
  const next = pickContinueLesson(course.lessons, lastLessonId, done);
  const started = lastLessonId !== undefined || doneCount > 0;
  const action = started ? t.continueAction : t.startAction;

  return (
    <Card className="relative flex h-full flex-col shadow-card transition-all hover:-translate-y-0.5 hover:border-primary has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-ring">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <BookOpen className="size-6 text-primary" />
          {total > 0 && doneCount === total && (
            <Badge className="gap-1 border-transparent bg-success text-success-foreground shadow-none hover:bg-success">
              <Check className="size-3" strokeWidth={3} /> {t.courseDone}
            </Badge>
          )}
        </div>
        <CardTitle className="pt-2.5 font-display text-2xl leading-snug font-medium tracking-normal">
          <h3>
            <Link
              to="/courses/$courseId"
              params={{ courseId: course.id }}
              data-card-link
              className="outline-none after:absolute after:inset-0 after:rounded-xl"
            >
              {course.title}
            </Link>
          </h3>
        </CardTitle>
        {course.description && (
          <CardDescription className="text-base">{course.description}</CardDescription>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-4" /> {t.modulesCount(course.moduleCount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-4" /> {t.lessonsCount(total)}
          </span>
        </div>
      </CardHeader>
      {next && (
        <CardFooter className="gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs text-muted-foreground tabular-nums">
              {t.lessonsDone(doneCount, total)}
            </p>
            <Progress value={(doneCount / total) * 100} aria-hidden className="h-1.5" />
          </div>
          <Button
            asChild
            size="sm"
            variant={started ? "default" : "outline"}
            className="relative z-10 shrink-0"
          >
            <Link
              to="/courses/$courseId/$lessonId"
              params={{ courseId: course.id, lessonId: next.id }}
              aria-label={`${action}: ${course.title}`}
            >
              {action} <ArrowRight />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
