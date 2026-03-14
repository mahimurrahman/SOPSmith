"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";

type SiteNavProps = {
  authenticated: boolean;
  className?: string;
};

const signedInItems = [
  {
    href: "/",
    label: "Home",
    matches(pathname: string, nextPath?: string) {
      void nextPath;
      return pathname === "/";
    },
  },
  {
    href: "/dashboard",
    label: "Library",
    matches(pathname: string, nextPath?: string) {
      void nextPath;
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    },
  },
  {
    href: "/dashboard/new",
    label: "New SOP",
    matches(pathname: string, nextPath?: string) {
      void nextPath;
      return pathname === "/dashboard/new";
    },
  },
];

const signedOutItems = [
  {
    href: "/",
    label: "Home",
    matches(pathname: string, nextPath?: string) {
      void nextPath;
      return pathname === "/";
    },
  },
  {
    href: "/login?next=%2Fdashboard",
    label: "Library",
    matches(pathname: string, nextPath: string) {
      return pathname === "/login" && nextPath === "/dashboard";
    },
  },
  {
    href: "/login?next=%2Fdashboard%2Fnew",
    label: "New SOP",
    matches(pathname: string, nextPath: string) {
      return pathname === "/login" && nextPath === "/dashboard/new";
    },
  },
];

export function SiteNav({ authenticated, className }: SiteNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "";
  const items = authenticated ? signedInItems : signedOutItems;

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-full border border-border bg-surface-muted p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const active = authenticated ? item.matches(pathname) : item.matches(pathname, nextPath);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium text-foreground/82",
              active
                ? "bg-foreground text-accent-foreground shadow-soft"
                : "hover:bg-surface hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
