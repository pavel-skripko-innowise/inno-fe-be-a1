import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Markdown } from "@/components/markdown/Markdown";
import { useCourse } from "@/components/course/CourseContext";
import { courseQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { useI18n } from "@/lib/locale";

export const Route = createFileRoute("/courses/$courseId/modules/$moduleId")({
  loader: async ({ context, params }) => {
    const locale = await resolveLocale(context.queryClient);
    const { course } = await context.queryClient.ensureQueryData(
      courseQuery(locale, params.courseId),
    );
    const module = course.modules.find((item) => item.id === params.moduleId);
    if (!module) throw notFound();
    return { title: module.title, course: course.title };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · ${loaderData.course}` : "Модуль не найден" },
    ],
  }),
  notFoundComponent: ModuleMissing,
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const { t } = useI18n();
  const { course, linkIndex } = useCourse();
  const index = course.modules.findIndex((item) => item.id === moduleId);
  const module = course.modules[index];
  const nextModule = course.modules[index + 1];
  const firstLesson = module?.lessons[0];
  if (!module) return null;

  return (
    <div className="mx-auto max-w-4xl px-5 pt-16 pb-24 sm:px-10 lg:pt-14">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 text-sm text-muted-foreground">
        <span>{t.moduleCounter(index + 1, course.modules.length)}</span>
        {firstLesson && (
          <Link
            to="/courses/$courseId/$lessonId"
            params={{ courseId: course.id, lessonId: firstLesson.id }}
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            {t.moduleOpenFirst} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {module.pagePath ? (
        <article id="module-page" className="lesson-prose">
          <Markdown markdown={module.pageMarkdown} path={module.pagePath} linkIndex={linkIndex} />
        </article>
      ) : (
        <section>
          <h1 className="font-display text-4xl leading-tight">{module.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.moduleNoPage}</p>
          <ol className="mt-8 divide-y divide-border border-y border-border">
            {module.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  to="/courses/$courseId/$lessonId"
                  params={{ courseId: course.id, lessonId: lesson.id }}
                  className="group flex items-center gap-4 py-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary font-mono text-xs tabular-nums text-muted-foreground">
                    {lesson.number}
                  </span>
                  <span className="flex-1 font-medium group-hover:text-primary">
                    {lesson.title}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="mt-16 flex flex-wrap justify-between gap-4 border-t border-border pt-8">
        {index > 0 ? (
          <Link
            to="/courses/$courseId/modules/$moduleId"
            params={{ courseId: course.id, moduleId: course.modules[index - 1]!.id }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" /> {t.previousModule}
          </Link>
        ) : (
          <span />
        )}
        {nextModule && (
          <Link
            to="/courses/$courseId/modules/$moduleId"
            params={{ courseId: course.id, moduleId: nextModule.id }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t.nextModule} <ArrowRight className="size-4" />
          </Link>
        )}
      </nav>
    </div>
  );
}

function ModuleMissing() {
  const { t } = useI18n();
  return <p className="p-10 text-muted-foreground">{t.moduleMissing}</p>;
}
