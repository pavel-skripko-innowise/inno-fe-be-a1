import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SettingsMenu } from "@/components/SettingsMenu";
import { messagesFor } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/locale";
import { localesQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { themeInitScript, useSettings, writeLocaleCookie } from "@/lib/settings";

function NotFoundComponent() {
  const t = messagesFor(useSettings().locale);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.pageMissingTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.pageMissingBody}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const t = messagesFor(useSettings().locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t.pageErrorTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.pageErrorBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.tryAgain}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.goHome}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    const locales = await context.queryClient.ensureQueryData(localesQuery());
    const locale = await resolveLocale(context.queryClient);
    return { locale, locales };
  },
  head: ({ loaderData }) => {
    const t = messagesFor(loaderData?.locale ?? "ru");
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: t.siteTitle },
        { name: "description", content: t.siteDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Onest:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { locale, locales } = Route.useLoaderData();
  const stored = useSettings().locale;
  const router = useRouter();
  const tried = useRef<string | null>(null);

  useEffect(() => {
    if (stored === locale) {
      tried.current = null;
      return;
    }
    if (tried.current === stored) return;
    tried.current = stored;
    writeLocaleCookie(stored);
    void router.invalidate();
  }, [stored, locale, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider locale={locale} locales={locales}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <SettingsMenu />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
