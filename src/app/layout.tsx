import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { SkipLink } from "@/components/layout/SkipLink";
import { site } from "@/content/site";
import { isTodo } from "@/lib/todo";
import { reportTodosAtBuild } from "@/lib/todo-report";
import { cn } from "@/lib/utils";
import { GsapRegister } from "@/providers/GsapRegister";
import { SmoothScroll } from "@/providers/SmoothScroll";

import { clashDisplay, geistMono, geistSans, instrumentSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: isTodo(site.tagline) ? site.name : `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: isTodo(site.description) ? undefined : site.description,
  applicationName: site.name,
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  reportTodosAtBuild();

  return (
    <html
      lang="en"
      className={cn(
        "dark",
        clashDisplay.variable,
        geistSans.variable,
        geistMono.variable,
        instrumentSerif.variable,
      )}
    >
      <body>
        <SkipLink label={site.labels.skipLink} />
        <GsapRegister />
        <SmoothScroll>
          <Nav />
          <main id="content" tabIndex={-1} className="pt-(--nav-height) outline-none">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
