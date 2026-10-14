import type { SimpleIcon } from "simple-icons";

/** A simple-icons logo as inline SVG (brand colour unless `color` is given). */
export function BrandIcon({
  icon,
  className,
  color,
}: {
  icon: SimpleIcon;
  className?: string;
  color?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d={icon.path} fill={color ?? `#${icon.hex}`} />
    </svg>
  );
}
