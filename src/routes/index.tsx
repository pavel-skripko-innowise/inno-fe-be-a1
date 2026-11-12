import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t.catalogEyebrow}</p>
      <h1 className="mt-3 font-display text-5xl leading-tight">{t.catalogTitle}</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">{t.catalogLead}</p>

      {sections.length === 0 ? (
        <p className="mt-12 rounded-lg border border-dashed border-border p-8 text-muted-foreground">
          {emptyBefore}
          <code className="font-mono">config.json</code>
          {emptyAfter}
        </p>
      ) : (
        <div className="mt-14 space-y-16">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-display text-3xl leading-tight">{section.title}</h2>
              {section.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">{section.description}</p>
              )}
              {section.courses.length === 0 ? (
                <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-muted-foreground">
                  {t.sectionEmpty}
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {section.courses.map((c) => (
                    <Link
                      key={c.id}
                      to="/courses/$courseId"
                      params={{ courseId: c.id }}
                      className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary"
                    >
                      <BookOpen className="size-6 text-primary" />
                      <h3 className="mt-4 font-display text-2xl leading-snug">{c.title}</h3>
                      {c.description && <p className="mt-2 flex-1 text-muted-foreground">{c.description}</p>}
                      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{t.courseStats(c.moduleCount, c.lessonCount)}</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
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
