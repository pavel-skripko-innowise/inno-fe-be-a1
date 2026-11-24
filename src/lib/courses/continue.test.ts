import { describe, expect, it } from "vitest";
import {
  addLastLesson,
  parseLastLessons,
  pickContinueLesson,
  serializeLastLessons,
} from "./continue";

const lessons = ["a", "b", "c", "d"].map((id, i) => ({ id, number: `0.${i}`, title: id }));

describe("pickContinueLesson", () => {
  it("returns the last opened lesson while it is not done", () => {
    expect(pickContinueLesson(lessons, "b", new Set(["a"]))?.id).toBe("b");
  });

  it("moves on to the next lesson that is not done", () => {
    expect(pickContinueLesson(lessons, "b", new Set(["b", "c"]))?.id).toBe("d");
  });

  it("wraps to an earlier lesson that is not done", () => {
    expect(pickContinueLesson(lessons, "d", new Set(["b", "c", "d"]))?.id).toBe("a");
  });

  it("starts from the first lesson that is not done when nothing was opened", () => {
    expect(pickContinueLesson(lessons, undefined, new Set())?.id).toBe("a");
    expect(pickContinueLesson(lessons, undefined, new Set(["a"]))?.id).toBe("b");
  });

  it("ignores a lesson that no longer exists", () => {
    expect(pickContinueLesson(lessons, "gone", new Set(["a"]))?.id).toBe("b");
  });

  it("keeps the last opened lesson when the whole course is done", () => {
    expect(pickContinueLesson(lessons, "c", new Set(["a", "b", "c", "d"]))?.id).toBe("c");
  });

  it("returns nothing for a course without lessons", () => {
    expect(pickContinueLesson([], "a", new Set())).toBeUndefined();
  });
});

describe("last lessons", () => {
  it("round-trips through the cookie format", () => {
    const list = [
      { courseId: "a-1", lessonId: "0-1-базы-данных" },
      { courseId: "b-1", lessonId: "intro" },
    ];
    expect(parseLastLessons(serializeLastLessons(list))).toEqual(list);
  });

  it("ignores malformed values", () => {
    expect(parseLastLessons(undefined)).toEqual([]);
    expect(parseLastLessons("not json")).toEqual([]);
    expect(parseLastLessons('{"a":1}')).toEqual([]);
    expect(parseLastLessons('[["a-1","x"],["b-1"],[1,2]]')).toEqual([
      { courseId: "a-1", lessonId: "x" },
    ]);
  });

  it("keeps one entry per course with the most recent first", () => {
    const list = [
      { courseId: "a-1", lessonId: "x" },
      { courseId: "b-1", lessonId: "y" },
    ];
    expect(addLastLesson(list, { courseId: "b-1", lessonId: "z" })).toEqual([
      { courseId: "b-1", lessonId: "z" },
      { courseId: "a-1", lessonId: "x" },
    ]);
    expect(addLastLesson(list, { courseId: "c-1", lessonId: "w" }, 2)).toHaveLength(2);
  });
});
