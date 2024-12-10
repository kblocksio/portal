import * as LucideIcons from "lucide-react"; // Import all icons
import { BoxesIcon, LucideProps } from "lucide-react"; // Import props type
import * as OutlineHeroIcons from "@heroicons/react/24/outline";
import * as SolidHeroIcons from "@heroicons/react/24/solid";
import type { Colors } from "./colors.ts";
import React, { memo, useMemo } from "react";
import { cn } from "./utils.ts";

export type LucideIconString = keyof typeof LucideIcons;
export type HeroIconString = `heroicon://${string}`;
export type SvgString = `<svg${string}>`;
export type XmlString = `<?xml${string}>`;

export type Icon =
  | LucideIconString
  | HeroIconString
  | SvgString
  | XmlString
  | string;

/**
 *  Supprts 3 types of icons:
 *  - Heroicons
 *  - SVG
 *  - LucideIcons
 *
 * @see {@link Icon}
 */
export const getIconComponent = ({
  solid = false,
  icon,
}: {
  solid?: boolean;
  icon?: Icon;
}): React.ComponentType<{ className?: string }> => {
  // handle empty icon or heroicon
  if (!icon || icon.startsWith("heroicon://")) {
    const HeroIcon = getHeroIconComponent({ solid, icon });
    const HeroIconComponent = (props: { className?: string }) => (
      <HeroIcon {...props} />
    );
    HeroIconComponent.displayName = "icon";
    return HeroIconComponent;
  }

  // handle SVG strings
  if (icon.startsWith("<svg") || icon.startsWith("<?xml")) {
    // remove the "width" and "height" attributes from the <svg>
    const parser = new DOMParser();
    const doc = parser.parseFromString(icon, "image/svg+xml");
    const svg = doc.getElementsByTagName("svg")[0]!;
    svg.removeAttribute("width");
    svg.removeAttribute("height");

    const SvgIcon = (props: { className?: string }) => (
      <div
        {...props}
        dangerouslySetInnerHTML={{ __html: svg.outerHTML }}
        aria-hidden="true"
      />
    );
    SvgIcon.displayName = "icon";
    return SvgIcon;
  }

  // handle Lucide icons
  return getLucideIcon(icon);
};

/**
 * Memoized icon component.
 *
 * @see {@link getIconComponent}
 */
export const useIconComponent = ({ icon }: { icon?: Icon }) => {
  return useMemo(() => getIconComponent({ icon }), [icon]);
};

export const getIconColors = (options: {
  darkenOnGroupHover?: boolean;
  forceDarken?: boolean;
  color?: Colors | string;
}) => {
  const color: Colors =
    options.color && Object.keys(colors).includes(options.color)
      ? (options.color as Colors)
      : "slate";

  const chosenColor = cn([
    colors[color].default,
    options.darkenOnGroupHover && colors[color].groupHover,
    options.forceDarken && colors[color].forceDarken,
  ]);

  return chosenColor;
};

const getHeroIconName = (heroiconId: string): string => {
  const parts = heroiconId.split("-");
  const resourceName = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `${resourceName}Icon`;
};

const getHeroIconComponent = ({
  solid = false,
  icon = "code-bracket-square",
}: {
  solid?: boolean;
  icon?: string;
}) => {
  if (icon.startsWith("heroicon://")) {
    icon = icon.split("heroicon://")[1]!;
  }
  const iconSet = solid ? SolidHeroIcons : OutlineHeroIcons;
  const iconComponent = iconSet[getHeroIconName(icon) as keyof typeof iconSet];
  if (iconComponent) {
    return iconComponent;
  } else {
    return iconSet.CogIcon;
  }
};

const getLucideIcon = (icon: string) => {
  // eslint-disable-next-line import/namespace
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons];
  if (
    typeof IconComponent === "function" ||
    (IconComponent && "render" in IconComponent)
  ) {
    // eslint-disable-next-line react/display-name
    return (props?: LucideProps) => {
      const Icon = IconComponent as React.ElementType;
      return <Icon {...props} />;
    };
  } else {
    console.log(
      `Icon "${icon}" not found or is not a valid component, fallback to BoxesIcon`,
    );
    // eslint-disable-next-line react/display-name
    return (props?: LucideProps) => <BoxesIcon {...props} />;
  }
};

interface ColorSet {
  default: string;
  groupHover: string;
  forceDarken: string;
}

const colors: Record<Colors, ColorSet> = {
  orange: {
    default: "text-orange-500 dark:text-orange-400",
    groupHover: "group-hover:text-orange-600 dark:group-hover:text-orange-300",
    forceDarken: "text-orange-600 dark:text-orange-300",
  },
  sky: {
    default: "text-sky-500 dark:text-sky-400",
    groupHover: "group-hover:text-sky-600 dark:group-hover:text-sky-300",
    forceDarken: "text-sky-600 dark:text-sky-300",
  },
  emerald: {
    default: "text-emerald-500 dark:text-emerald-400",
    groupHover:
      "group-hover:text-emerald-600 dark:group-hover:text-emerald-300",
    forceDarken: "text-emerald-600 dark:text-emerald-300",
  },
  lime: {
    default: "text-lime-500 dark:text-lime-400",
    groupHover: "group-hover:text-lime-600 dark:group-hover:text-lime-300",
    forceDarken: "text-lime-600 dark:text-lime-300",
  },
  pink: {
    default: "text-pink-500 dark:text-pink-400",
    groupHover: "group-hover:text-pink-600 dark:group-hover:text-pink-300",
    forceDarken: "text-pink-600 dark:text-pink-300",
  },
  amber: {
    default: "text-amber-500 dark:text-amber-400",
    groupHover: "group-hover:text-amber-600 dark:group-hover:text-amber-300",
    forceDarken: "text-amber-600 dark:text-amber-300",
  },
  cyan: {
    default: "text-cyan-500 dark:text-cyan-400",
    groupHover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-300",
    forceDarken: "text-cyan-600 dark:text-cyan-300",
  },
  purple: {
    default: "text-purple-500 dark:text-purple-400",
    groupHover: "group-hover:text-purple-600 dark:group-hover:text-purple-300",
    forceDarken: "text-purple-600 dark:text-purple-300",
  },
  red: {
    default: "text-red-700 dark:text-red-400",
    groupHover: "group-hover:text-red-700 dark:group-hover:text-red-300",
    forceDarken: "text-red-700 dark:text-red-300",
  },
  violet: {
    default: "text-violet-700 dark:text-violet-400",
    groupHover: "group-hover:text-violet-700 dark:group-hover:text-violet-300",
    forceDarken: "text-violet-700 dark:text-violet-300",
  },
  slate: {
    default: "text-slate-700 dark:text-slate-400",
    groupHover: "group-hover:text-slate-600 dark:group-hover:text-slate-300",
    forceDarken: "text-slate-600 dark:text-slate-300",
  },
};

/**
 * Memoized resource icon component.
 *
 * @see {@link useIconComponent}
 * @see {@link Icon}
 */
export const ResourceIcon = memo(function ResourceIcon({
  icon,
  className,
}: {
  icon?: Icon;
  className?: string;
}) {
  const IconComponent = useIconComponent({ icon });
  return <IconComponent className={className} />;
});
