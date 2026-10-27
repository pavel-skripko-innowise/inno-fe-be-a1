import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown/Markdown";
import { TableOfContents } from "@/components/course/TableOfContents";
import { useCourse } from "@/components/course/CourseContext";
import { courseQuery } from "@/lib/courses/courses.functions";
import { flattenLessons } from "@/lib/courses/types";
import { useSettings } from "@/lib/settings";
import { useScrollMemory } from "@/lib/scroll-position";

export const Route = createFileRoute("/courses/$courseId/$lessonId")({
  loader: async ({ context, params }) => {
    const { course } = await context.queryClient.ensureQueryData(courseQuery(params.courseId));
    const lesson = flattenLessons(course).find((l) => l.id === params.lessonId);
    if (!lesson) throw notFound();
    return { title: lesson.title, course: course.title };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} · ${loaderData.course}` : "Урок не найден";
    const description = loaderData ? `Урок курса «${loaderData.course}»` : "Урок не найден";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => <p className="p-10 text-muted-foreground">Урок не найден.</p>,
  component: LessonPage,
});

function ReadingBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 right-0 left-0 z-40 h-0.5">
      <div className="h-full bg-primary" style={{ width: `${p * 100}%` }} />
    </div>
  );
}

function LessonPage() {
  const { lessonId } = Route.useParams();
  const { course, linkIndex, done, toggle } = useCourse();
  const navigate = useNavigate();
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const module = course.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
  const isDone = done.has(lessonId);
  const { rememberPosition } = useSettings();
  useScrollMemory(`${course.id}/${lessonId}`, "lesson", rememberPosition);

  // Arrow keys switch lessons (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : undefined;
      if (target)
        navigate({
          to: "/courses/$courseId/$lessonId",
          params: { courseId: course.id, lessonId: target.id },
        });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, course.id, navigate]);

  // Scroll to #hash after the lesson renders (links from other lessons).
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) document.getElementById(hash)?.scrollIntoView();
  }, [lessonId]);

  if (!lesson) return null;

  return (
    <>
      <ReadingBar />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-16 pb-24 sm:px-10 lg:pt-14 xl:grid-cols-[minmax(0,1fr)_220px]">
        <main className="min-w-0">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              {module?.title} <span className="mx-1.5">·</span>
              <span className="font-mono tabular-nums">
                {index + 1} / {lessons.length}
              </span>
            </p>
            <Button variant={isDone ? "success" : "outline"} size="sm" onClick={() => toggle(lessonId)}>
              <Check /> {isDone ? "Пройдено" : "Отметить пройденным"}
            </Button>
          </div>

          <article id="lesson" className="lesson-prose">
            <Markdown markdown={lesson.markdown} path={lesson.path} linkIndex={linkIndex} />
          </article>

          <nav className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {prev ? (
              <PagerLink courseId={course.id} lesson={prev} dir="prev" />
            ) : (
              <span />
            )}
            {next && <PagerLink courseId={course.id} lesson={next} dir="next" />}
          </nav>
        </main>
        <aside className="hidden xl:block">
          <div className="sticky top-14 max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain pr-2 pb-6">
            <TableOfContents articleId="lesson" deps={lessonId} />
          </div>
        </aside>
      </div>
    </>
  );
}

function PagerLink({
  courseId,
  lesson,
  dir,
}: {
  courseId: string;
  lesson: { id: string; title: string; number: string };
  dir: "prev" | "next";
}) {
  return (
    <Link
      to="/courses/$courseId/$lessonId"
      params={{ courseId, lessonId: lesson.id }}
      className={`group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary ${dir === "next" ? "text-right sm:col-start-2" : ""}`}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground data-[dir=next]:justify-end" data-dir={dir}>
        {dir === "prev" && <ChevronLeft className="size-3.5" />}
        {dir === "prev" ? "Назад" : "Далее"}
        {dir === "next" && <ChevronRight className="size-3.5" />}
      </span>
      <span className="mt-1 block font-medium group-hover:text-primary">
        <span className="mr-2 font-mono text-sm text-primary">{lesson.number}</span>
        {lesson.title}
      </span>
    </Link>
  );
}
