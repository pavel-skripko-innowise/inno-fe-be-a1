import { createFileRoute, redirect } from "@tanstack/react-router";
import { courseQuery } from "@/lib/courses/courses.functions";
import { flattenLessons } from "@/lib/courses/types";

export const Route = createFileRoute("/courses/$courseId/")({
  loader: async ({ context, params }) => {
    const { course } = await context.queryClient.ensureQueryData(courseQuery(params.courseId));
    const first = flattenLessons(course)[0];
    if (first)
      throw redirect({
        to: "/courses/$courseId/$lessonId",
        params: { courseId: course.id, lessonId: first.id },
        replace: true,
      });
  },
  component: () => <p className="p-10 text-muted-foreground">В курсе пока нет уроков.</p>,
});
