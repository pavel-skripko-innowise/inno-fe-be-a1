import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileQuestionMark } from "lucide-react";
import { Markdown } from "@/components/markdown/Markdown";
import { useCourse } from "@/components/course/CourseContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
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
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
        <Badge variant="secondary" className="font-medium">
          {t.moduleCounter(index + 1, course.modules.length)}
        </Badge>
        {firstLesson && (
          <Button asChild variant="link" className="h-auto px-0">
            <Link
              to="/courses/$courseId/$lessonId"
              params={{ courseId: course.id, lessonId: firstLesson.id }}
            >
              {t.moduleOpenFirst} <ArrowRight />
            </Link>
          </Button>
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
          <ol className="mt-8 flex flex-col gap-2">
            {module.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Item asChild variant="outline" className="bg-card [a]:hover:border-primary">
                  <Link
                    to="/courses/$courseId/$lessonId"
                    params={{ courseId: course.id, lessonId: lesson.id }}
                  >
                    <ItemMedia className="size-10 rounded-lg bg-secondary font-mono text-xs tabular-nums text-muted-foreground">
                      {lesson.number}
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-base group-hover/item:text-primary">
                        {lesson.title}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover/item:translate-x-1 group-hover/item:text-primary" />
                    </ItemActions>
                  </Link>
                </Item>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="mt-16 flex flex-wrap justify-between gap-4 border-t border-border pt-8">
        {index > 0 ? (
          <Button asChild variant="ghost" className="text-primary hover:text-primary">
            <Link
              to="/courses/$courseId/modules/$moduleId"
              params={{ courseId: course.id, moduleId: course.modules[index - 1]!.id }}
            >
              <ArrowLeft /> {t.previousModule}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {nextModule && (
          <Button asChild variant="ghost" className="text-primary hover:text-primary">
            <Link
              to="/courses/$courseId/modules/$moduleId"
              params={{ courseId: course.id, moduleId: nextModule.id }}
            >
              {t.nextModule} <ArrowRight />
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}

function ModuleMissing() {
  const { t } = useI18n();
  const { courseId } = useParams({ strict: false });
  return (
    <Empty className="min-h-[70vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionMark />
        </EmptyMedia>
        <EmptyTitle className="font-display text-2xl">
          <h1>{t.moduleMissing}</h1>
        </EmptyTitle>
      </EmptyHeader>
      {courseId && (
        <EmptyContent>
          <Button asChild>
            <Link to="/courses/$courseId" params={{ courseId }} activeOptions={{ exact: true }}>
              {t.courseProgram}
            </Link>
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
