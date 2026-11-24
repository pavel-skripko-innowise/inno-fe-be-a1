import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Check, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { flattenLessons, type Lesson } from "@/lib/courses/types";
import { useI18n } from "@/lib/locale";
import { useCourse } from "./CourseContext";

const INTRO = "#intro";

function snippet(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return null;
  const start = Math.max(0, i - 30);
  const clean = (s: string) => s.replace(/[#*`>_[\]]/g, "").replace(/\s+/g, " ");
  return {
    before: (start > 0 ? "…" : "") + clean(text.slice(start, i)),
    match: text.slice(i, i + q.length),
    after: clean(text.slice(i + q.length, i + q.length + 50)) + "…",
  };
}

type FoundLesson = Lesson & { hit: ReturnType<typeof snippet> };

function findLessons(lessons: Lesson[], q: string): FoundLesson[] {
  return lessons
    .map((l) => ({
      ...l,
      hit: q && !l.title.toLowerCase().includes(q) ? snippet(l.markdown, q) : null,
    }))
    .filter((l) => !q || l.title.toLowerCase().includes(q) || l.hit);
}

type Group = {
  id: string;
  title: string;
  /** Module number and badge colour; the introduction has neither. */
  index?: number;
  color?: string;
  lessons: Lesson[];
  found: FoundLesson[];
};

export function CourseSidebar() {
  const { course, done, toggle } = useCourse();
  const { t } = useI18n();
  const { lessonId, moduleId } = useParams({ strict: false });
  const sidebar = useSidebar();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const search = useRef<HTMLInputElement>(null);
  const [mod, setMod] = useState("Ctrl");
  const lessons = flattenLessons(course);
  const doneCount = lessons.filter((l) => done.has(l.id)).length;
  const share = lessons.length ? doneCount / lessons.length : 0;

  const groups = useMemo(() => {
    const list: Group[] = [];
    if (course.lessons.length)
      list.push({
        id: INTRO,
        title: t.introduction,
        lessons: course.lessons,
        found: findLessons(course.lessons, q),
      });
    course.modules.forEach((m, i) => {
      const found = findLessons(m.lessons, q);
      if (q && !found.length && !`${m.title}\n${m.pageMarkdown}`.toLowerCase().includes(q)) return;
      list.push({
        id: m.id,
        title: m.title,
        index: i + 1,
        color: m.badgeColor,
        lessons: m.lessons,
        found,
      });
    });
    return list.filter((g) => !q || g.index !== undefined || g.found.length);
  }, [course, q, t]);

  const activeGroup = lessonId
    ? course.lessons.some((l) => l.id === lessonId)
      ? INTRO
      : course.modules.find((m) => m.lessons.some((l) => l.id === lessonId))?.id
    : moduleId;
  const [expanded, setExpanded] = useState(() => new Set(activeGroup ? [activeGroup] : []));
  const setGroupOpen = (id: string, open: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });

  useEffect(() => {
    if (activeGroup)
      setExpanded((prev) => (prev.has(activeGroup) ? prev : new Set(prev).add(activeGroup)));
  }, [activeGroup]);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setMod("⌘");
  }, []);

  const { isMobile, setOpen, setOpenMobile } = sidebar;
  const focusSearch = useCallback(() => {
    if (isMobile) setOpenMobile(true);
    else setOpen(true);
    setTimeout(() => search.current?.focus());
  }, [isMobile, setOpen, setOpenMobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      focusSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusSearch]);

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const revealActive = useCallback((link: HTMLAnchorElement | null) => {
    if (!link) return;
    // Wait for the group to finish expanding before measuring.
    setTimeout(() => {
      const box = link.closest<HTMLElement>('[data-sidebar="content"]');
      if (!box) return;
      const item = link.getBoundingClientRect();
      const view = box.getBoundingClientRect();
      if (item.top < view.top || item.bottom > view.bottom)
        box.scrollTo({
          top: box.scrollTop + item.top - view.top - view.height / 3,
          behavior: "smooth",
        });
    }, 250);
  }, []);

  return (
    <>
      <SidebarHeader className="gap-3 p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-1.5 text-xs font-normal text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden [&_svg]:size-3.5"
          >
            <Link to="/" onClick={closeMobile}>
              <ArrowLeft /> {t.allSections}
            </Link>
          </Button>
          <SidebarTrigger
            aria-label={t.toggleMenu}
            title={`${t.toggleMenu} (${mod}+B)`}
            className="hidden size-8 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex"
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
          <ProgressRing value={share} size={44}>
            <span className="text-[10px] font-semibold text-sidebar-accent-foreground tabular-nums">
              {Math.round(share * 100)}%
            </span>
          </ProgressRing>
          <div className="min-w-0">
            <h2 className="font-display text-base leading-snug text-sidebar-accent-foreground">
              {course.title}
            </h2>
            <p className="mt-0.5 text-xs text-sidebar-foreground/60">
              {t.lessonsDone(doneCount, lessons.length)}
            </p>
          </div>
        </div>

        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-sidebar-foreground/50" />
          <SidebarInput
            ref={search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder={t.searchCourse}
            aria-label={t.searchCourse}
            className="h-9 border-sidebar-border bg-sidebar-accent/40 pr-14 pl-8 text-sidebar-foreground placeholder:text-sidebar-foreground/40"
          />
          <Kbd className="absolute top-1/2 right-2 hidden -translate-y-1/2 border border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/50 lg:inline-flex">
            {mod} K
          </Kbd>
        </div>

        <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`${course.title} · ${t.lessonsDone(doneCount, lessons.length)}`}
              aria-label={`${t.progress}: ${t.lessonsDone(doneCount, lessons.length)}`}
              onClick={() => setOpen(true)}
            >
              <ProgressRing value={share} size={16} />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t.searchCourse}
              aria-label={t.searchCourse}
              onClick={focusSearch}
            >
              <Search />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent
        role="navigation"
        aria-label={t.courseNav}
        className="pb-6 [scrollbar-color:var(--sidebar-border)_transparent] [scrollbar-width:thin]"
      >
        {groups.length === 0 && (
          <p className="px-4 py-3 text-sm text-sidebar-foreground/60">{t.nothingFound}</p>
        )}
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {groups.map((g) => {
              const open = !!q || expanded.has(g.id);
              const groupDone = g.lessons.filter((l) => done.has(l.id)).length;
              const summary = (
                <>
                  <GroupBadge
                    index={g.index}
                    color={g.color}
                    complete={g.lessons.length > 0 && groupDone === g.lessons.length}
                  />
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:sr-only">
                    <span className="block leading-snug">{g.title}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] text-sidebar-foreground/55">
                      <Progress
                        value={g.lessons.length ? (groupDone / g.lessons.length) * 100 : 0}
                        aria-hidden
                        className="h-1 w-14 bg-sidebar-border *:bg-sidebar-primary"
                      />
                      <span className="tabular-nums">
                        {groupDone}/{g.lessons.length}
                      </span>
                    </span>
                  </div>
                </>
              );
              return (
                <Collapsible
                  key={g.id}
                  asChild
                  open={open}
                  onOpenChange={(value) => setGroupOpen(g.id, value)}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      tooltip={g.title}
                      isActive={g.index !== undefined && g.id === moduleId}
                      data-current={g.id === activeGroup}
                      className="h-auto min-h-12 items-start group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:data-[current=true]:bg-sidebar-accent"
                    >
                      {g.index !== undefined ? (
                        <Link
                          to="/courses/$courseId/modules/$moduleId"
                          params={{ courseId: course.id, moduleId: g.id }}
                          onClick={() => {
                            setGroupOpen(g.id, true);
                            closeMobile();
                          }}
                        >
                          {summary}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => {
                            if (sidebar.state === "collapsed") {
                              setOpen(true);
                              setGroupOpen(g.id, true);
                            } else setGroupOpen(g.id, !open);
                          }}
                        >
                          {summary}
                        </button>
                      )}
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction
                        aria-label={t.toggleLessons}
                        className="top-3.5! text-sidebar-foreground/50 transition-transform data-[state=open]:rotate-90"
                      >
                        <ChevronRight />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                      <SidebarMenuSub className="relative mx-0 ml-4 translate-x-0 gap-0.5 border-l-0 px-0 py-1 before:absolute before:inset-y-2.5 before:left-2 before:w-px before:bg-sidebar-border">
                        {g.found.map((l) => {
                          const isDone = done.has(l.id);
                          const isActive = l.id === lessonId;
                          return (
                            <SidebarMenuSubItem key={l.id} className="relative">
                              <Checkbox
                                checked={isDone}
                                onCheckedChange={() => toggle(l.id)}
                                aria-label={isDone ? t.markNotDone : t.markDone}
                                className={cn(
                                  "absolute top-[7px] left-0 z-10 size-4 rounded-full border-sidebar-foreground/30 bg-sidebar shadow-none transition-colors after:absolute after:-inset-1.5 hover:border-sidebar-foreground/70 data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground [&_svg]:size-2.5 [&_svg]:stroke-[3.5]",
                                  isActive &&
                                    "border-sidebar-primary before:absolute before:inset-0 before:m-auto before:size-1.5 before:rounded-full before:bg-sidebar-primary data-[state=checked]:before:hidden",
                                )}
                              />
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                                className="ml-6 h-auto min-h-7 translate-x-0 items-start py-1.5 leading-snug"
                              >
                                <Link
                                  ref={isActive ? revealActive : undefined}
                                  to="/courses/$courseId/$lessonId"
                                  params={{ courseId: course.id, lessonId: l.id }}
                                  onClick={closeMobile}
                                >
                                  <span
                                    className={cn(
                                      "mt-px min-w-9 font-mono text-[11px] tabular-nums",
                                      isActive
                                        ? "text-sidebar-primary"
                                        : "text-sidebar-foreground/45",
                                    )}
                                  >
                                    {l.number}
                                  </span>
                                  <div
                                    className={cn(
                                      "min-w-0 flex-1",
                                      isDone && !isActive && "text-sidebar-foreground/70",
                                    )}
                                  >
                                    {l.title}
                                    {l.hit && (
                                      <span className="mt-1 block text-xs text-sidebar-foreground/60">
                                        {l.hit.before}
                                        <mark className="rounded-sm bg-sidebar-primary/30 text-sidebar-accent-foreground">
                                          {l.hit.match}
                                        </mark>
                                        {l.hit.after}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

function GroupBadge({
  index,
  color,
  complete,
}: {
  index: number | undefined;
  color: string | undefined;
  complete: boolean;
}) {
  return (
    <span
      className={cn(
        "relative grid size-8 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:text-[9px]",
        color ? "text-white" : "bg-sidebar-primary/15 text-sidebar-primary",
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {index === undefined ? <BookOpen className="size-4" /> : String(index).padStart(2, "0")}
      {complete && (
        <span className="absolute right-0 bottom-0 grid size-3.5 translate-x-1/4 translate-y-1/4 place-items-center rounded-full bg-success text-success-foreground ring-2 ring-sidebar">
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      )}
    </span>
  );
}

function ProgressRing({
  value,
  size,
  children,
}: {
  value: number;
  size: number;
  children?: ReactNode;
}) {
  const stroke = size > 24 ? 4 : 2.5;
  const r = (size - stroke) / 2;
  const length = 2 * Math.PI * r;
  return (
    <span className="relative grid shrink-0 place-items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-sidebar-border"
        />
        {value > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - value)}
            className="stroke-sidebar-primary transition-[stroke-dashoffset] duration-500"
          />
        )}
      </svg>
      {children && <span className="absolute">{children}</span>}
    </span>
  );
}
