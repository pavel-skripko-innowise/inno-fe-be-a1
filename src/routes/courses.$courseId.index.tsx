import { createFileRoute, redirect } from "@tanstack/react-router";
import { courseQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { flattenLessons } from "@/lib/courses/types";
import { useI18n } from "@/lib/locale";

export const Route = createFileRoute("/courses/$courseId/")({
  loader: async ({ context, params }) => {
    const locale = await resolveLocale(context.queryClient);
    const { course } = await context.queryClient.ensureQueryData(courseQuery(locale, params.courseId));
    const first = flattenLessons(course)[0];
    if (first)
      throw redirect({
        to: "/courses/$courseId/$lessonId",
        params: { courseId: course.id, lessonId: first.id },
        replace: true,
      });
  },
  component: EmptyCourse,
});

function EmptyCourse() {
  const { t } = useI18n();
  return <p className="p-10 text-muted-foreground">{t.courseEmpty}</p>;
}
