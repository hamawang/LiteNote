import { icons } from "./iconPaths";

interface IconProps {
  name: keyof typeof icons;
  className?: string;
}

export function Icon({ name, className = "h-4 w-4" }: IconProps) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg className={className} viewBox={icon.viewBox} fill="currentColor" aria-hidden>
      {icon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
