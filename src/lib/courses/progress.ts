import { useCallback, useEffect, useState } from "react";

/** Per-course "lesson done" marks, stored in localStorage. */
export function useProgress(courseId: string) {
  const key = `course-progress:${courseId}`;
  const [done, setDone] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      setDone(new Set(JSON.parse(localStorage.getItem(key) ?? "[]")));
    } catch {
      setDone(new Set());
    }
  }, [key]);

  const toggle = useCallback(
    (lessonId: string) =>
      setDone((prev) => {
        const next = new Set(prev);
        if (next.has(lessonId)) next.delete(lessonId);
        else next.add(lessonId);
        localStorage.setItem(key, JSON.stringify([...next]));
        return next;
      }),
    [key],
  );

  return { done, toggle };
}
