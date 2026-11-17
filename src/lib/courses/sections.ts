import type { CourseSummary, Section, SectionMeta } from "./types";

/**
 * Language folder inside a course: `backend/A/1/ru` → locale `ru`, path `backend/A/1`.
 * The course directory's own name is the language code. Section directories (`backend`) have none.
 */
export function splitContentLocale(relDir: string): { locale: string; path: string } | null {
  const parts = relDir.split("/");
  const locale = parts.at(-1) ?? "";
  if (parts.length < 2 || !/^[a-z]{2}$/.test(locale)) return null;
  return { locale, path: parts.slice(0, -1).join("/") };
}

/** Requested language, or Russian, or the first available language. */
export function pickLocale(requested: string, locales: string[]) {
  if (locales.includes(requested)) return requested;
  if (locales.includes("ru")) return "ru";
  return locales[0] ?? "ru";
}

/** Longest section directory that contains the course directory. Paths have the language folder removed (`backend/A/1`). */
export function resolveSectionDir(courseRelDir: string, sectionRelDirs: string[]): string | null {
  let best: string | null = null;
  for (const sectionDir of sectionRelDirs) {
    if (!sectionDir || courseRelDir === sectionDir) continue;
    if (
      courseRelDir.startsWith(`${sectionDir}/`) &&
      (best === null || sectionDir.length > best.length)
    ) {
      best = sectionDir;
    }
  }
  return best;
}

/** Course path with the owning section directory removed, so course ids stay stable when a section folder is added. */
export function coursePathWithinSection(
  courseRelDir: string,
  sectionRelDir: string | null,
): string {
  if (sectionRelDir && courseRelDir.startsWith(`${sectionRelDir}/`)) {
    return courseRelDir.slice(sectionRelDir.length + 1);
  }
  return courseRelDir;
}

/** Group course summaries under the sections declared in content. Unknown section ids are appended so a course is never dropped. */
export function mapCoursesToSections(sections: SectionMeta[], courses: CourseSummary[]): Section[] {
  const grouped = new Map<string, CourseSummary[]>();
  for (const course of courses) {
    const list = grouped.get(course.sectionId);
    if (list) list.push(course);
    else grouped.set(course.sectionId, [course]);
  }

  const mapped: Section[] = sections.map((section) => ({
    ...section,
    courses: grouped.get(section.id) ?? [],
  }));

  const known = new Set(sections.map((section) => section.id));
  for (const [id, group] of grouped) {
    if (known.has(id)) continue;
    mapped.push({ id, title: id, description: "", courses: group });
  }
  return mapped;
}
