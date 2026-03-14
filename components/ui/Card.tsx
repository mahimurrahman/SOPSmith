import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  tone?: "surface" | "muted" | "strong";
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

export function Card<T extends ElementType = "div">({
  as,
  children,
  className,
  tone = "surface",
  ...props
}: CardProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn(
        tone === "surface" && "surface-card",
        tone === "muted" && "muted-panel",
        tone === "strong" &&
          "border border-border bg-surface-strong shadow-panel backdrop-blur-md",
        "rounded-panel",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
