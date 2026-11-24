import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Ghost button for the dark title bar above code blocks and diagrams. */
export function CodeBarButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-7 gap-1.5 px-2 text-xs font-normal text-inherit hover:bg-(--code-bg) hover:text-(--code-fg) [&_svg]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}
