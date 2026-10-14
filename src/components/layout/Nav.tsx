import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavIsland } from "@/components/layout/NavIsland";
import { site } from "@/content/site";

export function Nav() {
  return (
    <NavIsland
      brand={site.name}
      mark={<TemporaryApexMark className="w-6" />}
      links={site.nav}
      cta={site.cta}
      menu={
        <MobileMenu
          links={site.nav.filter((link) => link.href !== site.cta.href)}
          cta={site.cta}
          labels={{ openMenu: site.labels.openMenu, menuTitle: site.labels.menuTitle }}
        />
      }
    />
  );
}
