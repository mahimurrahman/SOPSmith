import type { Metadata, Viewport } from "next";

import { ToastProvider } from "@/components/ui/toast-provider";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "SOPSmith",
  category: "business",
  creator: "SOPSmith",
  title: {
    default: "SOPSmith",
    template: "%s | SOPSmith",
  },
  description:
    "Turn rough operational notes into clear SOPs your team can use today.",
  keywords: [
    "SOP generator",
    "standard operating procedure",
    "operations",
    "process documentation",
    "runbooks",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  robots: {
    follow: true,
    index: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#091018",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
