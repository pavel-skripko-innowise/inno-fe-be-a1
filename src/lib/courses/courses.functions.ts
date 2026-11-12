import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { notFound } from "@tanstack/react-router";
import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { pickLocale } from "./sections";
import type { CourseSummary, LinkIndex, SectionMeta } from "./types";

const load = async () => import("virtual:courses-content");

export type Catalog = {
  locale: string;
  locales: string[];
  sections: SectionMeta[];
  courses: CourseSummary[];
};

export const listLocales = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    return (await load()).locales;
  },
);

export const readLocale = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return getCookie("locale") ?? "";
  } catch {
    return "";
  }
});

export const localesQuery = () =>
  queryOptions({ queryKey: ["locales"], queryFn: () => listLocales(), staleTime: Infinity });

export async function resolveLocale(queryClient: QueryClient) {
  const locales = await queryClient.ensureQueryData(localesQuery());
  return pickLocale(await readLocale(), locales);
}

export const getCatalog = createServerFn({ method: "GET" })
  .inputValidator((locale: string) => locale)
  .handler(async ({ data: locale }): Promise<Catalog> => {
    const { courses, sections, locales } = await load();
    const resolved = pickLocale(locale, locales);
    return {
      locale: resolved,
      locales,
      sections: sections.filter((section) => section.locale === resolved),
      courses: courses
        .filter((course) => course.locale === resolved)
        .map((course) => {
          const lessons = [
            ...(course.lessons ?? []),
            ...course.modules.flatMap((module) => module.lessons),
          ];
          return {
            id: course.id,
            sectionId: course.sectionId,
            title: course.title,
            description: course.description,
            moduleCount: course.modules.length,
            lessonCount: lessons.length,
            firstLessonId: lessons[0]?.id ?? null,
          };
        }),
    };
  });

export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((data: { locale: string; id: string }) => data)
  .handler(async ({ data }) => {
    const { courses, locales } = await load();
    const locale = pickLocale(data.locale, locales);
    const course = courses.find((item) => item.locale === locale && item.id === data.id);
    if (!course) throw notFound();
    const linkIndex: LinkIndex = {};
    for (const item of courses) {
      if (item.locale !== locale) continue;
      for (const lesson of item.lessons ?? [])
        linkIndex[lesson.path] = { courseId: item.id, lessonId: lesson.id };
      for (const module of item.modules) {
        if (module.pagePath)
          linkIndex[module.pagePath] = { courseId: item.id, moduleId: module.id };
        for (const lesson of module.lessons)
          linkIndex[lesson.path] = { courseId: item.id, lessonId: lesson.id };
      }
    }
    return { course, linkIndex };
  });

export const catalogQuery = (locale: string) =>
  queryOptions({ queryKey: ["catalog", locale], queryFn: () => getCatalog({ data: locale }) });

export const courseQuery = (locale: string, id: string) =>
  queryOptions({
    queryKey: ["course", locale, id],
    queryFn: () => getCourse({ data: { locale, id } }),
  });
