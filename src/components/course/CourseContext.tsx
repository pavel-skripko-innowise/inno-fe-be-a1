import { createContext, useContext } from "react";
import type { Course, LinkIndex } from "@/lib/courses/types";

type Value = {
  course: Course;
  linkIndex: LinkIndex;
  done: Set<string>;
  toggle: (lessonId: string) => void;
};

export const CourseContext = createContext<Value | null>(null);

export function useCourse() {
  const value = useContext(CourseContext);
  if (!value) throw new Error("useCourse must be used inside a course route");
  return value;
}
