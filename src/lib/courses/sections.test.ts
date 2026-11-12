import { describe, expect, it } from "vitest";
import {
  coursePathWithinSection,
  mapCoursesToSections,
  pickLocale,
  resolveSectionDir,
  splitContentLocale,
} from "./sections";
import type { CourseSummary, SectionMeta } from "./types";

const summary = (id: string, sectionId: string): CourseSummary => ({
  id,
  sectionId,
  title: id,
  description: "",
  moduleCount: 1,
  lessonCount: 1,
  firstLessonId: "intro",
});

describe("splitContentLocale", () => {
  it("reads the language folder inside a course", () => {
    expect(splitContentLocale("backend/A/1/ru")).toEqual({ locale: "ru", path: "backend/A/1" });
    expect(splitContentLocale("testing/AQA/1/en")).toEqual({ locale: "en", path: "testing/AQA/1" });
  });

  it("ignores the section directory and a language folder that is not the course directory", () => {
    expect(splitContentLocale("backend")).toBeNull();
    expect(splitContentLocale("backend/A/1")).toBeNull();
    expect(splitContentLocale("backend/ru/A/1")).toBeNull();
    expect(splitContentLocale("ru")).toBeNull();
  });
});

describe("pickLocale", () => {
  it("keeps a requested language that exists and otherwise prefers Russian", () => {
    expect(pickLocale("en", ["ru", "en"])).toBe("en");
    expect(pickLocale("de", ["ru", "en"])).toBe("ru");
    expect(pickLocale("de", ["en"])).toBe("en");
    expect(pickLocale("", [])).toBe("ru");
  });
});

describe("resolveSectionDir", () => {
  const sections = ["backend", "testing", "backend/advanced"];

  it("picks the nearest section directory", () => {
    expect(resolveSectionDir("backend/advanced/A/1", sections)).toBe("backend/advanced");
    expect(resolveSectionDir("backend/A/1", sections)).toBe("backend");
    expect(resolveSectionDir("testing/AQA/1", sections)).toBe("testing");
  });

  it("does not match a directory that only shares a prefix", () => {
    expect(resolveSectionDir("backend-extra/A/1", sections)).toBeNull();
    expect(resolveSectionDir("backend", sections)).toBeNull();
  });
});

describe("coursePathWithinSection", () => {
  it("drops the section directory so existing course ids stay the same", () => {
    expect(coursePathWithinSection("backend/A/1", "backend")).toBe("A/1");
    expect(coursePathWithinSection("testing/AQA/1", "testing")).toBe("AQA/1");
  });
});

describe("mapCoursesToSections", () => {
  const sections: SectionMeta[] = [
    { id: "backend", locale: "ru", title: "Back End", description: "Сервер" },
    { id: "testing", locale: "ru", title: "Тестирование", description: "Тесты" },
  ];

  it("maps courses onto sections and keeps both orders", () => {
    const courses = [summary("b-1", "backend"), summary("a-1", "backend"), summary("aqa-1", "testing")];
    const mapped = mapCoursesToSections(sections, courses);

    expect(mapped.map((section) => section.id)).toEqual(["backend", "testing"]);
    expect(mapped[0]?.courses.map((course) => course.id)).toEqual(["b-1", "a-1"]);
    expect(mapped[1]?.courses.map((course) => course.id)).toEqual(["aqa-1"]);
  });

  it("keeps a section that has no courses yet", () => {
    const mapped = mapCoursesToSections(sections, [summary("a-1", "backend")]);
    expect(mapped[1]).toMatchObject({ id: "testing", courses: [] });
  });

  it("appends a course whose section was not declared", () => {
    const mapped = mapCoursesToSections(sections, [summary("fe-1", "frontend")]);
    expect(mapped.at(-1)).toMatchObject({ id: "frontend", courses: [expect.objectContaining({ id: "fe-1" })] });
  });
});
