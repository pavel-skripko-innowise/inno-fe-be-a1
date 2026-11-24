import { isValidElement, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resolveLink } from "@/lib/courses/links";
import type { LinkIndex } from "@/lib/courses/types";
import { useI18n } from "@/lib/locale";
import { CodeBarButton } from "./CodeBarButton";
import { MermaidDiagram } from "./MermaidDiagram";

const LANG_LABEL: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  cs: "C#",
  csharp: "C#",
  sh: "Shell",
  bash: "Shell",
  shell: "Shell",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
  html: "HTML",
  css: "CSS",
  go: "Go",
  java: "Java",
  http: "HTTP",
  text: "Text",
  plaintext: "Text",
};

function CodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const className = isValidElement<{ className?: string }>(children)
    ? (children.props.className ?? "")
    : "";
  const lang = className.match(/language-([\w+-]+)/)?.[1];
  if (lang === "mermaid" && isValidElement<{ children?: ReactNode }>(children))
    return <MermaidDiagram code={String(children.props.children ?? "").trim()} />;

  const copy = async () => {
    await navigator.clipboard.writeText(ref.current?.innerText ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span>{lang ? (LANG_LABEL[lang] ?? lang) : t.code}</span>
        <CodeBarButton onClick={copy} aria-label={t.copyCode}>
          {copied ? <Check /> : <Copy />}
          {copied ? t.copied : t.copy}
        </CodeBarButton>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}

type Props = { markdown: string; path: string; linkIndex: LinkIndex };

function resolveImage(src: string) {
  // Keep repository-relative image links readable in GitHub Markdown, while
  // serving assets from Vite's public directory inside the course UI.
  const marker = "public/";
  const publicIndex = src.indexOf(marker);
  if (publicIndex >= 0 && !/^[a-z][a-z0-9+.-]*:/i.test(src))
    return `/${src.slice(publicIndex + marker.length)}`;
  return src;
}

export function Markdown({ markdown, path, linkIndex }: Props) {
  const { t } = useI18n();
  const components: Components = {
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    table: ({ node: _node, ...props }) => (
      <div className="my-6 overflow-hidden rounded-lg border">
        <Table {...props} className="text-[0.95rem]" />
      </div>
    ),
    thead: ({ node: _node, ...props }) => <TableHeader {...props} className="bg-secondary" />,
    tbody: ({ node: _node, ...props }) => <TableBody {...props} />,
    tr: ({ node: _node, ...props }) => <TableRow {...props} />,
    th: ({ node: _node, ...props }) => (
      <TableHead {...props} className="h-auto px-3.5 py-2.5 font-semibold text-foreground" />
    ),
    td: ({ node: _node, ...props }) => <TableCell {...props} className="px-3.5 py-2.5 align-top" />,
    a: ({ href = "", children }) => {
      const link = resolveLink(href, path, linkIndex);
      switch (link.kind) {
        case "lesson":
          return (
            <Link
              to="/courses/$courseId/$lessonId"
              params={{ courseId: link.courseId, lessonId: link.lessonId }}
              {...(link.hash ? { hash: link.hash } : {})}
            >
              {children}
            </Link>
          );
        case "module":
          return (
            <Link
              to="/courses/$courseId/modules/$moduleId"
              params={{ courseId: link.courseId, moduleId: link.moduleId }}
              {...(link.hash ? { hash: link.hash } : {})}
            >
              {children}
            </Link>
          );
        case "anchor":
          return <a href={`#${link.hash}`}>{children}</a>;
        case "external":
          return (
            <a href={link.href} target="_blank" rel="noreferrer noopener">
              {children}
              <ExternalLink className="external-icon" aria-hidden />
            </a>
          );
        default:
          return (
            <a href={link.href} className="broken-link" title={t.missingFile}>
              {children}
            </a>
          );
      }
    },
    img: ({ src = "", alt = "" }) => (
      <img
        src={resolveImage(src)}
        alt={alt}
        className="my-5 max-h-48 max-w-full object-contain"
        loading="lazy"
      />
    ),
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false, ignoreMissing: true }]]}
      components={components}
    >
      {markdown}
    </ReactMarkdown>
  );
}
