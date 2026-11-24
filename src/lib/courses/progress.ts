import { useCallback, useEffect, useState } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { addLastLesson, parseLastLessons, serializeLastLessons } from "./continue";

const progressKey = (courseId: string) => `course-progress:${courseId}`;

function readDone(courseId: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(progressKey(courseId)) ?? "[]"));
  } catch {
    return new Set();
  }
}

/** Per-course "lesson done" marks, stored in localStorage. */
export function useProgress(courseId: string) {
  const key = progressKey(courseId);
  const [done, setDone] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDone(readDone(courseId));
  }, [courseId]);

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

/** Done marks for several courses; empty until mounted because they live in localStorage. */
export function useDoneByCourse(courseIds: string[]): Record<string, Set<string>> {
  const [done, setDone] = useState<Record<string, Set<string>>>({});
  const ids = courseIds.join("\n");

  useEffect(() => {
    setDone(Object.fromEntries(ids.split("\n").map((id) => [id, readDone(id)])));
  }, [ids]);

  return done;
}

// A cookie rather than localStorage so the catalog can render "continue" on the server.
const LAST_COOKIE = "last_lessons";

export const readLastLessons = createIsomorphicFn()
  .server(() => {
    try {
      return parseLastLessons(getCookie(LAST_COOKIE));
    } catch {
      return [];
    }
  })
  .client(() => {
    const entry = document.cookie.split("; ").find((part) => part.startsWith(`${LAST_COOKIE}=`));
    return parseLastLessons(
      entry ? decodeURIComponent(entry.slice(LAST_COOKIE.length + 1)) : undefined,
    );
  });

export function rememberLesson(courseId: string, lessonId: string) {
  const list = addLastLesson(readLastLessons(), { courseId, lessonId });
  document.cookie = `${LAST_COOKIE}=${encodeURIComponent(serializeLastLessons(list))}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
