import { useEffect, useId, useState } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/locale";

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
  return (
    <div className="mermaid-controls">
      <button type="button" onClick={() => zoomIn()} aria-label={t.zoomIn}>
        <Plus />
      </button>
      <button type="button" onClick={() => zoomOut()} aria-label={t.zoomOut}>
        <Minus />
      </button>
      <button type="button" onClick={() => resetTransform()} aria-label={t.resetZoom}>
        <RotateCcw />
      </button>
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
          <button type="button" onClick={() => setOpen(true)}>
            <Maximize2 className="size-3.5" /> {t.fullscreen}
          </button>
        )}
      </div>
      {error ? (
        <div className="mermaid-error">
          <p>{t.diagramError(error)}</p>
          <pre>{code}</pre>
        </div>
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
