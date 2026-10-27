import { useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { CourseContext } from "@/components/course/CourseContext";
import { courseQuery } from "@/lib/courses/courses.functions";
import { useProgress } from "@/lib/courses/progress";

export const Route = createFileRoute("/courses/$courseId")({
  loader: async ({ context, params }) => {
    const { course } = await context.queryClient.ensureQueryData(courseQuery(params.courseId));
    return { title: course.title };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} · Курсы` : "Курс не найден" }],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Курс не найден</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          К списку курсов
        </Link>
      </div>
    </div>
  ),
  component: CourseLayout,
});

function CourseLayout() {
  const { courseId } = Route.useParams();
  const { data } = useSuspenseQuery(courseQuery(courseId));
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
            <SheetTitle className="sr-only">Навигация по курсу</SheetTitle>
            <CourseSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="fixed top-3 left-3 z-30 grid size-10 place-items-center rounded-md border border-border bg-card shadow-sm lg:hidden"
            aria-label="Открыть меню"
          >
            <Menu className="size-5" />
          </button>
          <Outlet />
        </div>
      </div>
    </CourseContext.Provider>
  );
}
