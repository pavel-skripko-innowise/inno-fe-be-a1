export type Lesson = {
  id: string;
  /** Display number, e.g. "1.2" (module.lesson) */
  number: string;
  title: string;
  /** Path of the .md file relative to the content root (posix) */
  path: string;
  markdown: string;
};

export type CourseModule = {
  id: string;
  title: string;
  pagePath: string;
  pageMarkdown: string;
  badgeColor: string;
  lessons: Lesson[];
};

export type SectionMeta = {
  id: string;
  locale: string;
  title: string;
  description: string;
};

export type Course = {
  id: string;
  locale: string;
  sectionId: string;
  title: string;
  description: string;
  lessons: Lesson[];
  modules: CourseModule[];
};

export type CourseSummary = {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  moduleCount: number;
  lessonCount: number;
  firstLessonId: string | null;
};

export type Section = SectionMeta & { courses: CourseSummary[] };

/** root-relative .md path -> where it lives in the app */
export type LinkIndex = Record<
  string,
  { courseId: string; lessonId: string } | { courseId: string; moduleId: string }
>;

export const flattenLessons = (course: Course) => [
  ...course.lessons,
  ...course.modules.flatMap((m) => m.lessons),
];
