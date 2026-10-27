import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { coursesQuery } from "@/lib/courses/courses.functions";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQuery()),
  head: () => ({
    meta: [
      { title: "Курсы для сотрудников" },
      { name: "description", content: "Каталог обучающих курсов для сотрудников команды." },
      { property: "og:title", content: "Курсы для сотрудников" },
      { property: "og:description", content: "Каталог обучающих курсов для сотрудников команды." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { data: courses } = useSuspenseQuery(coursesQuery());
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Обучение</p>
      <h1 className="mt-3 font-display text-5xl leading-tight">Курсы</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">
        Выберите курс, чтобы продолжить с того места, где остановились.
      </p>

      {courses.length === 0 ? (
        <p className="mt-12 rounded-lg border border-dashed border-border p-8 text-muted-foreground">
          Курсы не найдены. Добавьте папку с <code className="font-mono">config.json</code> в каталог
          контента.
        </p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c.id}
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary"
            >
              <BookOpen className="size-6 text-primary" />
              <h2 className="mt-4 font-display text-2xl leading-snug">{c.title}</h2>
              {c.description && <p className="mt-2 flex-1 text-muted-foreground">{c.description}</p>}
              <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {c.moduleCount} мод. · {c.lessonCount} уроков
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
