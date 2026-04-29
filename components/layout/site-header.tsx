import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

type SiteHeaderProps = {
  actions?: ReactNode;
  className?: string;
  signedIn?: boolean;
  subtitle?: string;
};

export function SiteHeader({ actions, signedIn = false, subtitle }: SiteHeaderProps) {
  if (signedIn) {
    return <AppHeader actions={actions} subtitle={subtitle} />;
  }

  return <MarketingHeader actions={actions} signedIn={signedIn} />;
}
