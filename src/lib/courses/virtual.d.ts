declare module "virtual:courses-content" {
  import type { Course, SectionMeta } from "@/lib/courses/types";
  export const locales: string[];
  export const sections: SectionMeta[];
  export const courses: Course[];
}
