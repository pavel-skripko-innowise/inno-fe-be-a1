import { useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { CourseContext } from "@/components/course/CourseContext";
import { courseQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { useProgress } from "@/lib/courses/progress";
import { messagesFor } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";

export const Route = createFileRoute("/courses/$courseId")({
  loader: async ({ context, params }) => {
    const locale = await resolveLocale(context.queryClient);
    const { course } = await context.queryClient.ensureQueryData(
      courseQuery(locale, params.courseId),
    );
    return { title: course.title, locale };
  },
  head: ({ loaderData }) => {
    const t = messagesFor(loaderData?.locale ?? "ru");
    return {
      meta: [{ title: loaderData ? `${loaderData.title} · ${t.coursesBrand}` : t.courseMissing }],
    };
  },
  notFoundComponent: CourseMissing,
  component: CourseLayout,
});

function CourseMissing() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">{t.courseMissing}</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          {t.backToSections}
        </Link>
      </div>
    </div>
  );
}

function CourseLayout() {
  const { courseId } = Route.useParams();
  const { locale, t } = useI18n();
  const { data } = useSuspenseQuery(courseQuery(locale, courseId));
  const progress = useProgress(courseId);
  const [open, setOpen] = useState(false);

  return (
    <CourseContext.Provider value={{ ...data, ...progress }}>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-80 shrink-0 lg:block">
          <CourseSidebar />
        </aside>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-80 border-0 p-0">
            <SheetTitle className="sr-only">{t.courseNav}</SheetTitle>
            <CourseSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="fixed top-3 left-3 z-30 grid size-10 place-items-center rounded-md border border-border bg-card shadow-sm lg:hidden"
            aria-label={t.openMenu}
          >
            <Menu className="size-5" />
          </button>
          <Outlet />
        </div>
      </div>
    </CourseContext.Provider>
  );
}
