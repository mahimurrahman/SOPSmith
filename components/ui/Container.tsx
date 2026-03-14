import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  children,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
