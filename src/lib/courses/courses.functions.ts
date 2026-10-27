import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import type { CourseSummary, LinkIndex } from "./types";

const load = async () => (await import("virtual:courses-content")).courses;

export const listCourses = createServerFn({ method: "GET" }).handler(
  async (): Promise<CourseSummary[]> => {
    const courses = await load();
    return courses.map((c) => {
      const lessons = c.modules.flatMap((m) => m.lessons);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        moduleCount: c.modules.length,
        lessonCount: lessons.length,
        firstLessonId: lessons[0]?.id ?? null,
      };
    });
  },
);

export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const courses = await load();
    const course = courses.find((c) => c.id === id);
    if (!course) throw notFound();
    const linkIndex: LinkIndex = {};
    for (const c of courses)
      for (const m of c.modules)
        for (const l of m.lessons) linkIndex[l.path] = { courseId: c.id, lessonId: l.id };
    return { course, linkIndex };
  });

export const coursesQuery = () =>
  queryOptions({ queryKey: ["courses"], queryFn: () => listCourses() });

export const courseQuery = (id: string) =>
  queryOptions({ queryKey: ["course", id], queryFn: () => getCourse({ data: id }) });
