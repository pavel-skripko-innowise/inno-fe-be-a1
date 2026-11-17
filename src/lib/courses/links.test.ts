import { describe, expect, it } from "vitest";
import { resolveLink } from "./links";

const index = {
  "backend/a1/02 Базы данных.md": { courseId: "backend-a1", lessonId: "02-базы-данных" },
  "backend/a1/modules/02-access.md": { courseId: "backend-a1", moduleId: "access-control" },
  "frontend/intro/01-start.md": { courseId: "frontend-intro", lessonId: "01-start" },
};
const from = "backend/a1/01 Введение.md";

describe("resolveLink", () => {
  it("resolves sibling lesson with encoded name and hash", () => {
    expect(resolveLink("./02%20Базы%20данных.md#индексы", from, index)).toEqual({
      kind: "lesson",
      courseId: "backend-a1",
      lessonId: "02-базы-данных",
      hash: "индексы",
    });
  });
  it("resolves lesson in another course via ..", () => {
    expect(resolveLink("../../frontend/intro/01-start.md", from, index)).toMatchObject({
      kind: "lesson",
      courseId: "frontend-intro",
    });
  });
  it("resolves module pages from relative Markdown links", () => {
    expect(resolveLink("./modules/02-access.md", from, index)).toEqual({
      kind: "module",
      courseId: "backend-a1",
      moduleId: "access-control",
      hash: undefined,
    });
  });
  it("keeps in-page anchors and external links", () => {
    expect(resolveLink("#итоги", from, index)).toEqual({ kind: "anchor", hash: "итоги" });
    expect(resolveLink("https://x.dev", from, index).kind).toBe("external");
  });
  it("marks unknown targets", () => {
    expect(resolveLink("missing.md", from, index).kind).toBe("unknown");
  });
});
