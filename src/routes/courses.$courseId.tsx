import type { CSSProperties } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookX, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Sidebar, SidebarProvider, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { CourseContext } from "@/components/course/CourseContext";
import { courseQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { useProgress } from "@/lib/courses/progress";
import { messagesFor } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { readSidebarOpen } from "@/lib/settings";

export const Route = createFileRoute("/courses/$courseId")({
  loader: async ({ context, params }) => {
    const locale = await resolveLocale(context.queryClient);
    const { course } = await context.queryClient.ensureQueryData(
      courseQuery(locale, params.courseId),
    );
    return { title: course.title, locale, sidebarOpen: readSidebarOpen() };
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
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookX />
        </EmptyMedia>
        <EmptyTitle className="font-display text-2xl">
          <h1>{t.courseMissing}</h1>
        </EmptyTitle>
        <EmptyDescription>{t.pageMissingBody}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/">{t.backToSections}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function CourseLayout() {
  const { courseId } = Route.useParams();
  const { sidebarOpen } = Route.useLoaderData();
  const { locale, t } = useI18n();
  const { data } = useSuspenseQuery(courseQuery(locale, courseId));
  const progress = useProgress(courseId);

  return (
    <CourseContext.Provider value={{ ...data, ...progress }}>
      <SidebarProvider
        defaultOpen={sidebarOpen}
        style={{ "--sidebar-width": "20rem" } as CSSProperties}
      >
        <Sidebar collapsible="icon" className="border-sidebar-border">
          <CourseSidebar />
          <SidebarRail aria-label={t.toggleMenu} title={t.toggleMenu} />
        </Sidebar>
        <div className="min-w-0 flex-1">
          <MobileMenuButton />
          <Outlet />
        </div>
      </SidebarProvider>
    </CourseContext.Provider>
  );
}

function MobileMenuButton() {
  const { t } = useI18n();
  const { setOpenMobile } = useSidebar();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setOpenMobile(true)}
      className="fixed top-3 left-3 z-30 size-10 bg-card lg:hidden [&_svg]:size-5"
      aria-label={t.openMenu}
    >
      <Menu />
    </Button>
  );
}
