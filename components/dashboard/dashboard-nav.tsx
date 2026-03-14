"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/dashboard",
    label: "Library",
    isActive(pathname: string) {
      return pathname === "/dashboard" || (pathname.startsWith("/dashboard/") && pathname !== "/dashboard/new");
    },
  },
  {
    href: "/dashboard/new",
    label: "New SOP",
    isActive(pathname: string) {
      return pathname === "/dashboard/new";
    },
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 p-1">
      {items.map((item) => {
        const active = item.isActive(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              active
                ? "bg-white text-[#11161d]"
                : "text-foreground hover:bg-white/6"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
