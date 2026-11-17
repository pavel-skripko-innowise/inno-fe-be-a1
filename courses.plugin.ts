/**
 * Build-time course loader.
 *
 * Recursively scans COURSES_DIR (default: ./courses-content) for config.json files.
 * A section folder (`backend`, `testing`, …) has one `config.json` without `modules`.
 * Each course folder contains language folders (`backend/A/1/ru`, `backend/A/1/en`)
 * with that language's `config.json` and markdown. Course ids ignore the language
 * folder. Everything is exposed as the virtual
 * module `virtual:courses-content`. Content is bundled at build time, so the app
 * works on edge runtimes without filesystem access. In dev, edits trigger a reload.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv, type Plugin } from "vite";
import {
  coursePathWithinSection,
  resolveSectionDir,
  splitContentLocale,
} from "./src/lib/courses/sections";

const VIRTUAL_ID = "virtual:courses-content";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

type RawLesson = { id?: string; title?: string; file: string };
type RawModule = { id?: string; title: string; page?: string; lessons: RawLesson[] };
type RawCourseConfig = {
  id?: string;
  title?: string;
  description?: string;
  lessons?: RawLesson[];
  modules: RawModule[];
};
type RawSectionConfig = { id?: string; title?: string; description?: string; order?: number };
type LoadedConfig = {
  configPath: string;
  dir: string;
  relDir: string;
  data: Record<string, unknown>;
};

const toPosix = (p: string) => p.split(path.sep).join("/");

export function slugify(value: string) {
  return (
    value
      .normalize("NFC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function findConfigs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findConfigs(full));
    else if (entry.name === "config.json") out.push(full);
  }
  return out.sort();
}

function readConfigs(root: string): LoadedConfig[] {
  const out: LoadedConfig[] = [];
  for (const configPath of findConfigs(root)) {
    let data: unknown;
    try {
      data = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.warn(`[courses] Invalid JSON in ${configPath}:`, (e as Error).message);
      continue;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      console.warn(`[courses] ${configPath} must be a JSON object`);
      continue;
    }
    const dir = path.dirname(configPath);
    out.push({
      configPath,
      dir,
      relDir: toPosix(path.relative(root, dir)),
      data: data as Record<string, unknown>,
    });
  }
  return out;
}

function isCourseConfig(
  data: Record<string, unknown>,
): data is RawCourseConfig & Record<string, unknown> {
  return Array.isArray(data.modules);
}

function uniqueId(base: string, used: Set<string>) {
  let id = base || "item";
  while (used.has(id)) id += "-1";
  used.add(id);
  return id;
}

function loadLocale(root: string, projectRoot: string, configs: LoadedConfig[], locale: string) {
  const sectionConfigs = configs.filter((item) => !isCourseConfig(item.data));
  const courseConfigs = configs.filter((item) => isCourseConfig(item.data));
  const usedSectionIds = new Set<string>();

  const sections = sectionConfigs.map((item) => {
    const data = item.data as RawSectionConfig;
    const folder = item.relDir.split("/").pop() || "section";
    return {
      id: uniqueId(
        typeof data.id === "string" && data.id ? slugify(data.id) : slugify(folder),
        usedSectionIds,
      ),
      title: data.title?.trim() || folder,
      description: data.description ?? "",
      order: typeof data.order === "number" && Number.isFinite(data.order) ? data.order : 0,
      relDir: item.relDir,
    };
  });
  sections.sort((a, b) => a.order - b.order || a.relDir.localeCompare(b.relDir));

  const sectionRelDirs = sections.map((section) => section.relDir);
  const usedCourseIds = new Set<string>();
  const fallbackByFolder = new Map<string, string>();
  const courses = courseConfigs.map((item) => {
    const config = item.data as RawCourseConfig;
    const sectionRel = resolveSectionDir(item.relDir, sectionRelDirs);
    const section = sections.find((candidate) => candidate.relDir === sectionRel);
    let sectionId = section?.id;
    if (!sectionId) {
      const folder = item.relDir.split("/")[0] || "courses";
      sectionId = fallbackByFolder.get(folder);
      if (!sectionId) {
        sectionId = uniqueId(slugify(folder), usedSectionIds);
        fallbackByFolder.set(folder, sectionId);
        sections.push({
          id: sectionId,
          title: folder,
          description: "",
          order: Number.MAX_SAFE_INTEGER,
          relDir: "",
        });
      }
      console.warn(
        `[courses] ${item.relDir} is outside a section config.json; grouped as "${sectionId}"`,
      );
    }

    const within = coursePathWithinSection(item.relDir, sectionRel);
    const slug = within ? within.split("/").map(slugify).join("-") : "course";
    const id = uniqueId(config.id ? slugify(config.id) : slug, usedCourseIds);
    const usedLessonIds = new Set<string>();
    const loadLesson = (lesson: RawLesson, fallbackNumber: string) => {
      const filePath = path.resolve(item.dir, lesson.file);
      const lessonId = uniqueId(
        lesson.id ?? slugify(path.basename(lesson.file, path.extname(lesson.file))),
        usedLessonIds,
      );
      let markdown = "";
      try {
        markdown = fs.readFileSync(filePath, "utf8");
      } catch {
        console.warn(`[courses] Missing file ${filePath} (course ${item.relDir})`);
        markdown = `> Файл \`${lesson.file}\` не найден.`;
      }
      const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
      return {
        id: lessonId,
        number:
          path.basename(lesson.file).match(/^(\d+(?:\.\d+)*)(?=[\s._-])/)?.[1] ?? fallbackNumber,
        title: lesson.title ?? heading ?? lesson.file,
        path: toPosix(path.relative(root, filePath)).normalize("NFC"),
        markdown,
      };
    };
    const lessons = (config.lessons ?? []).map((lesson, li) => loadLesson(lesson, `0.${li}`));
    const modules = (config.modules ?? []).map((mod, mi) => {
      const pagePath = mod.page ? path.resolve(item.dir, mod.page) : "";
      let pageMarkdown = "";
      if (pagePath) {
        try {
          pageMarkdown = fs.readFileSync(pagePath, "utf8");
        } catch {
          console.warn(`[courses] Missing module page ${pagePath} (course ${item.relDir})`);
          pageMarkdown = `> Файл страницы модуля \`${mod.page}\` не найден.`;
        }
      }
      const badgeSource = pageMarkdown.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] ?? "";
      const publicMarker = "public/";
      const publicIndex = badgeSource.indexOf(publicMarker);
      let badgeColor = "";
      if (publicIndex >= 0 && !/^[a-z][a-z0-9+.-]*:/i.test(badgeSource)) {
        const badgeFile = path.resolve(
          projectRoot,
          "public",
          badgeSource.slice(publicIndex + publicMarker.length),
        );
        try {
          const svg = fs.readFileSync(badgeFile, "utf8");
          badgeColor = svg.match(/<circle\b[^>]*\bfill=["'](#[\da-f]{3,8})["']/i)?.[1] ?? "";
        } catch {
          console.warn(`[courses] Missing module badge ${badgeFile} (course ${item.relDir})`);
        }
      }
      return {
        id: mod.id ?? slugify(mod.title),
        title: mod.title,
        pagePath: pagePath ? toPosix(path.relative(root, pagePath)).normalize("NFC") : "",
        pageMarkdown,
        badgeColor,
        lessons: (mod.lessons ?? []).map((lesson, li) => loadLesson(lesson, `${mi + 1}.${li + 1}`)),
      };
    });

    return {
      id,
      locale,
      sectionId,
      title: config.title ?? item.relDir,
      description: config.description ?? "",
      lessons,
      modules,
    };
  });

  return {
    sections: sections.map(({ id, title, description }) => ({ id, locale, title, description })),
    courses,
  };
}

function loadContent(root: string, projectRoot: string) {
  const byLocale = new Map<string, LoadedConfig[]>();
  const sharedSections: LoadedConfig[] = [];
  for (const item of readConfigs(root)) {
    const split = splitContentLocale(item.relDir);
    if (!split) {
      if (!isCourseConfig(item.data)) {
        sharedSections.push(item);
        continue;
      }
      console.warn(
        `[courses] ${item.relDir || item.configPath} is outside a course language folder (backend/A/1/ru); skipped`,
      );
      continue;
    }
    const list = byLocale.get(split.locale) ?? [];
    list.push({ ...item, relDir: split.path });
    byLocale.set(split.locale, list);
  }
  for (const list of byLocale.values()) list.push(...sharedSections);

  const locales = [...byLocale.keys()].sort((a, b) =>
    a === "ru" ? -1 : b === "ru" ? 1 : a.localeCompare(b),
  );
  const sections = [];
  const courses = [];
  for (const locale of locales) {
    const loaded = loadLocale(root, projectRoot, byLocale.get(locale) ?? [], locale);
    sections.push(...loaded.sections);
    courses.push(...loaded.courses);
  }
  return { locales, sections, courses };
}

export function coursesContent(): Plugin {
  let root = "";
  let projectRoot = "";
  return {
    name: "courses-content",
    configResolved(config) {
      projectRoot = config.root;
      const env = loadEnv(config.mode, config.root, "");
      root = path.resolve(
        config.root,
        env["COURSES_DIR"] || process.env["COURSES_DIR"] || "courses-content",
      );
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      this.addWatchFile(root);
      const content = loadContent(root, projectRoot);
      return `export const locales = ${JSON.stringify(content.locales)};\nexport const sections = ${JSON.stringify(content.sections)};\nexport const courses = ${JSON.stringify(content.courses)};`;
    },
    configureServer(server) {
      server.watcher.add(root);
      const onChange = (file: string) => {
        if (!path.resolve(file).startsWith(root)) return;
        for (const env of Object.values(server.environments)) {
          const mod = env.moduleGraph.getModuleById(RESOLVED_ID);
          if (mod) env.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("change", onChange);
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}
