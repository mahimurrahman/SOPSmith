import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function getButtonClasses({
  className,
  size = "md",
  variant = "primary",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
    size === "sm" && "min-h-10 px-4 py-2 text-sm",
    size === "md" && "min-h-11 px-5 py-3 text-[0.95rem]",
    size === "lg" && "min-h-12 px-6 py-3 text-base",
    variant === "primary" && "bg-foreground text-accent-foreground shadow-soft hover:-translate-y-0.5 hover:opacity-95",
    variant === "secondary" && "border border-border bg-surface-muted text-foreground hover:-translate-y-0.5 hover:bg-surface",
    variant === "ghost" && "text-foreground hover:bg-surface-muted",
    className,
  );
}

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClasses({
        className,
        size,
        variant,
      })}
      {...props}
    />
  );
}
