import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { Grain } from "@/components/layout/Grain";
import { Nav } from "@/components/layout/Nav";
import { SkipLink } from "@/components/layout/SkipLink";
import { site } from "@/content/site";
import { isTodo } from "@/lib/todo";
import { reportTodosAtBuild } from "@/lib/todo-report";
import { cn } from "@/lib/utils";
import { GsapRegister } from "@/providers/GsapRegister";

import { clashDisplay, geistMono, geistSans, instrumentSerif, newsreader } from "./fonts";
import "./globals.css";

const defaultTitle = isTodo(site.tagline) ? site.name : `${site.name} — ${site.tagline}`;
const description = isTodo(site.description) ? undefined : site.description;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: `%s | ${site.name}` },
  description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en",
    url: "/",
    title: defaultTitle,
    description,
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
};

/** Vercel analytics scripts only exist on Vercel; loading them elsewhere logs 404s. */
const onVercel = Boolean(process.env.VERCEL);

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
        newsreader.variable,
      )}
    >
      <body>
        <SkipLink label={site.labels.skipLink} />
        <GsapRegister />
        <Nav />
        <main id="content" tabIndex={-1} className="pt-(--nav-height) outline-none">
          {children}
        </main>
        <Footer />
        <Grain />
        {onVercel && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
