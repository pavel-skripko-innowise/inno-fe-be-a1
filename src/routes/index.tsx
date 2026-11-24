import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { catalogQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { mapCoursesToSections } from "@/lib/courses/sections";
import { messagesFor } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const locale = await resolveLocale(context.queryClient);
    await context.queryClient.ensureQueryData(catalogQuery(locale));
    return { locale };
  },
  head: ({ loaderData }) => {
    const t = messagesFor(loaderData?.locale ?? "ru");
    return {
      meta: [
        { title: t.catalogTitle },
        { name: "description", content: t.catalogDescription },
        { property: "og:title", content: t.catalogTitle },
        { property: "og:description", content: t.catalogDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Catalog,
});

function Catalog() {
  const { locale, t } = useI18n();
  const { data } = useSuspenseQuery(catalogQuery(locale));
  const sections = mapCoursesToSections(data.sections, data.courses);
  const [emptyBefore, emptyAfter] = t.catalogEmpty.split("config.json");
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {t.catalogEyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-tight">{t.catalogTitle}</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">{t.catalogLead}</p>

      {sections.length === 0 ? (
        <Empty className="mt-12 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>{t.catalogTitle}</EmptyTitle>
            <EmptyDescription>
              {emptyBefore}
              <code className="font-mono">config.json</code>
              {emptyAfter}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-14 space-y-16">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-display text-3xl leading-tight">{section.title}</h2>
              {section.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">{section.description}</p>
              )}
              {section.courses.length === 0 ? (
                <Empty className="mt-6 border p-6 md:p-6">
                  <EmptyDescription>{t.sectionEmpty}</EmptyDescription>
                </Empty>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {section.courses.map((c) => (
                    <Link
                      key={c.id}
                      to="/courses/$courseId"
                      params={{ courseId: c.id }}
                      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card className="flex h-full flex-col shadow-card transition-all group-hover:-translate-y-0.5 group-hover:border-primary">
                        <CardHeader className="flex-1">
                          <BookOpen className="size-6 text-primary" />
                          <CardTitle className="pt-2.5 font-display text-2xl leading-snug font-medium tracking-normal">
                            <h3>{c.title}</h3>
                          </CardTitle>
                          {c.description && (
                            <CardDescription className="text-base">{c.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardFooter className="justify-between">
                          <Badge variant="secondary" className="font-medium">
                            {t.courseStats(c.moduleCount, c.lessonCount)}
                          </Badge>
                          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
