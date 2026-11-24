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
import { TriangleAlert } from "lucide-react";

import appCss from "../styles.css?url";
import { SettingsMenu } from "@/components/SettingsMenu";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { messagesFor } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/locale";
import { localesQuery, resolveLocale } from "@/lib/courses/courses.functions";
import { themeInitScript, useSettings, writeLocaleCookie } from "@/lib/settings";

function NotFoundComponent() {
  const t = messagesFor(useSettings().locale);
  return (
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia className="font-display text-7xl leading-none text-primary">404</EmptyMedia>
        <EmptyTitle className="font-display text-2xl">
          <h1>{t.pageMissingTitle}</h1>
        </EmptyTitle>
        <EmptyDescription>{t.pageMissingBody}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/">{t.goHome}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const t = messagesFor(useSettings().locale);

  return (
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle className="font-display text-2xl">
          <h1>{t.pageErrorTitle}</h1>
        </EmptyTitle>
        <EmptyDescription>{t.pageErrorBody}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        <Button
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          {t.tryAgain}
        </Button>
        <Button asChild variant="outline">
          <a href="/">{t.goHome}</a>
        </Button>
      </EmptyContent>
    </Empty>
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
