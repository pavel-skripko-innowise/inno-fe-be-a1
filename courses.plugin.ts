/**
 * Build-time course loader.
 *
 * Recursively scans COURSES_DIR (default: ./courses-content) for config.json files,
 * reads the markdown files they reference and exposes everything as the virtual
 * module `virtual:courses-content`. Content is bundled at build time, so the app
 * works on edge runtimes without filesystem access. In dev, edits trigger a reload.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv, type Plugin } from "vite";

const VIRTUAL_ID = "virtual:courses-content";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

type RawLesson = { id?: string; title?: string; file: string };
type RawModule = { title: string; lessons: RawLesson[] };
type RawConfig = { id?: string; title: string; description?: string; modules: RawModule[] };

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

function loadCourses(root: string) {
  const courses = [];
  for (const configPath of findConfigs(root)) {
    const dir = path.dirname(configPath);
    const relDir = toPosix(path.relative(root, dir));
    let config: RawConfig;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.warn(`[courses] Invalid JSON in ${configPath}:`, (e as Error).message);
      continue;
    }
    const usedIds = new Set<string>();
    const modules = (config.modules ?? []).map((mod, mi) => ({
      title: mod.title,
      lessons: (mod.lessons ?? []).map((lesson, li) => {
        const filePath = path.resolve(dir, lesson.file);
        let id = lesson.id ?? slugify(path.basename(lesson.file, path.extname(lesson.file)));
        while (usedIds.has(id)) id += "-1";
        usedIds.add(id);
        let markdown = "";
        try {
          markdown = fs.readFileSync(filePath, "utf8");
        } catch {
          console.warn(`[courses] Missing file ${filePath} (course ${relDir})`);
          markdown = `> Файл \`${lesson.file}\` не найден.`;
        }
        const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
        return {
          id,
          // Prefer the number from the file name ("0.1 Базы данных.md" -> "0.1"), else position.
          number:
            path.basename(lesson.file).match(/^(\d+(?:\.\d+)*)(?=[\s._-])/)?.[1] ?? `${mi + 1}.${li + 1}`,
          title: lesson.title ?? heading ?? lesson.file,
          path: toPosix(path.relative(root, filePath)).normalize("NFC"),
          markdown,
        };
      }),
    }));
    courses.push({
      id: config.id ?? (relDir ? relDir.split("/").map(slugify).join("-") : "course"),
      title: config.title ?? relDir,
      description: config.description ?? "",
      modules,
    });
  }
  return courses;
}

export function coursesContent(): Plugin {
  let root = "";
  return {
    name: "courses-content",
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, "");
      root = path.resolve(config.root, env["COURSES_DIR"] || process.env["COURSES_DIR"] || "courses-content");
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      this.addWatchFile(root);
      return `export const courses = ${JSON.stringify(loadCourses(root))};`;
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
