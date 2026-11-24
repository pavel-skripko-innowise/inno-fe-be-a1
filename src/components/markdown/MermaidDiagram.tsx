import { useEffect, useId, useState } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { Maximize2, Minus, Plus, RotateCcw, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/locale";
import { CodeBarButton } from "./CodeBarButton";

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;
function loadMermaid() {
  // Browser-only library: loaded lazily after hydration.
  mermaidPromise ??= import("mermaid").then(({ default: m }) => {
    m.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "strict",
      fontFamily: "Onest, system-ui, sans-serif",
    });
    return m;
  });
  return mermaidPromise;
}

function Controls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const { t } = useI18n();
  const actions = [
    { label: t.zoomIn, icon: Plus, run: () => zoomIn() },
    { label: t.zoomOut, icon: Minus, run: () => zoomOut() },
    { label: t.resetZoom, icon: RotateCcw, run: () => resetTransform() },
  ];
  return (
    <div className="absolute right-3 bottom-3 z-[5] flex gap-1 rounded-lg border bg-card p-1 shadow-card">
      {actions.map(({ label, icon: Icon, run }) => (
        <Button
          key={label}
          variant="ghost"
          size="icon"
          onClick={run}
          aria-label={label}
          className="size-8 text-muted-foreground"
        >
          <Icon />
        </Button>
      ))}
    </div>
  );
}

function ZoomableSvg({ svg, wheel }: { svg: string; wheel: boolean }) {
  return (
    <TransformWrapper
      minScale={0.3}
      maxScale={8}
      centerOnInit
      wheel={{ disabled: !wheel, step: 0.1 }}
      doubleClick={{ mode: "zoomIn" }}
    >
      <Controls />
      <TransformComponent wrapperClass="mermaid-viewport" contentClass="mermaid-content">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </TransformComponent>
    </TransformWrapper>
  );
}

export function MermaidDiagram({ code }: { code: string }) {
  const id = "mmd-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((m) => m.render(id, code))
      .then(({ svg }) => !cancelled && setSvg(svg))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  return (
    <div className="code-block mermaid-block">
      <div className="code-block__bar">
        <span>{t.diagram}</span>
        {svg && (
          <CodeBarButton onClick={() => setOpen(true)}>
            <Maximize2 /> {t.fullscreen}
          </CodeBarButton>
        )}
      </div>
      {error ? (
        <Alert variant="destructive" className="m-4 w-auto">
          <TriangleAlert className="size-4" />
          <AlertTitle>{t.diagramError(error)}</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 overflow-x-auto font-mono text-xs text-muted-foreground">
              {code}
            </pre>
          </AlertDescription>
        </Alert>
      ) : svg ? (
        <ZoomableSvg svg={svg} wheel={false} />
      ) : (
        <div className="mermaid-viewport mermaid-loading">{t.drawingDiagram}</div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mermaid-dialog">
          <DialogTitle className="sr-only">{t.diagram}</DialogTitle>
          {svg && <ZoomableSvg svg={svg} wheel />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
