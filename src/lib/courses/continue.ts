import type { LessonRef } from "./types";

export type LastLesson = { courseId: string; lessonId: string };

/** Last opened lesson per course, most recent course first. Ignores anything malformed. */
export function parseLastLessons(raw: string | undefined): LastLesson[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry) =>
      Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string"
        ? [{ courseId: entry[0], lessonId: entry[1] }]
        : [],
    );
  } catch {
    return [];
  }
}

export function serializeLastLessons(list: LastLesson[]): string {
  return JSON.stringify(list.map(({ courseId, lessonId }) => [courseId, lessonId]));
}

/** Moves `visit` to the front, keeping one entry per course and at most `limit` courses. */
export function addLastLesson(list: LastLesson[], visit: LastLesson, limit = 6): LastLesson[] {
  return [visit, ...list.filter((entry) => entry.courseId !== visit.courseId)].slice(0, limit);
}

/**
 * Where "continue" should lead: the last opened lesson while it is not done, otherwise
 * the next lesson that is not done (wrapping to the first one), otherwise the last opened lesson.
 */
export function pickContinueLesson(
  lessons: LessonRef[],
  lastLessonId: string | undefined,
  done: Set<string>,
): LessonRef | undefined {
  const at = lastLessonId ? lessons.findIndex((lesson) => lesson.id === lastLessonId) : -1;
  const last = lessons[at];
  if (last && !done.has(last.id)) return last;
  const pending = (lesson: LessonRef) => !done.has(lesson.id);
  return lessons.slice(at + 1).find(pending) ?? lessons.find(pending) ?? last ?? lessons[0];
}
