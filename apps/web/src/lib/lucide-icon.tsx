import * as LucideIcons from "lucide-react"; // Import all icons
import { BoxesIcon, LucideProps } from "lucide-react"; // Import props type

export const getLucideIcon = (icon: string) => {
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons];
  if (
    typeof IconComponent === "function" ||
    (IconComponent && "render" in IconComponent)
  ) {
    return (props?: LucideProps) => {
      const Icon = IconComponent as React.ElementType;
      return <Icon {...props} />;
    };
  } else {
    console.warn(
      `Icon "${icon}" not found or is not a valid component, fallback to BoxesIcon`,
    );
    return (props?: LucideProps) => <BoxesIcon {...props} />;
  }
};
