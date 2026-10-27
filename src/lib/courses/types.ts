export type Lesson = {
  id: string;
  /** Display number, e.g. "1.2" (module.lesson) */
  number: string;
  title: string;
  /** Path of the .md file relative to the content root (posix) */
  path: string;
  markdown: string;
};

export type CourseModule = { title: string; lessons: Lesson[] };

export type Course = {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
};

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
  moduleCount: number;
  lessonCount: number;
  firstLessonId: string | null;
};

/** root-relative .md path -> where it lives in the app */
export type LinkIndex = Record<string, { courseId: string; lessonId: string }>;

export const flattenLessons = (course: Course) => course.modules.flatMap((m) => m.lessons);
