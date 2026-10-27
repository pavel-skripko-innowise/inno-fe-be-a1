import { isValidElement, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink } from "lucide-react";
import { resolveLink } from "@/lib/courses/links";
import type { LinkIndex } from "@/lib/courses/types";
import { MermaidDiagram } from "./MermaidDiagram";

const LANG_LABEL: Record<string, string> = {
  js: "JavaScript", javascript: "JavaScript", ts: "TypeScript", typescript: "TypeScript",
  py: "Python", python: "Python", cs: "C#", csharp: "C#", sh: "Shell", bash: "Shell",
  shell: "Shell", sql: "SQL", json: "JSON", yaml: "YAML", yml: "YAML", xml: "XML",
  html: "HTML", css: "CSS", go: "Go", java: "Java", http: "HTTP", text: "Text", plaintext: "Text",
};

function CodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const className =
    isValidElement<{ className?: string }>(children) ? (children.props.className ?? "") : "";
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
        <span>{lang ? (LANG_LABEL[lang] ?? lang) : "Код"}</span>
        <button type="button" onClick={copy} aria-label="Скопировать код">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}

type Props = { markdown: string; path: string; linkIndex: LinkIndex };

export function Markdown({ markdown, path, linkIndex }: Props) {
  const components: Components = {
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    table: ({ children }) => (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    ),
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
            <a href={link.href} className="broken-link" title="Файл не найден в курсе">
              {children}
            </a>
          );
      }
    },
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
