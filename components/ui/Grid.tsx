import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type GridProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

export function Grid<T extends ElementType = "div">({
  as,
  children,
  className,
  gap = "md",
  ...props
}: GridProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn(
        "grid",
        gap === "sm" && "gap-4",
        gap === "md" && "gap-6",
        gap === "lg" && "gap-8",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
