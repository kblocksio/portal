import { getIconColors, ResourceIcon } from "@/lib/get-icon";
import { CardTitle, CardDescription } from "./ui/card";
import type { ExtendedResourceType } from "@/hooks/use-resource-types";

export interface WizardSimpleHeaderProps {
  title: string;
  description: string;
  resourceType: ExtendedResourceType;
}

export const WizardSimpleHeader = ({
  title,
  description,
  resourceType,
}: WizardSimpleHeaderProps) => {
  const iconColor = getIconColors({ color: resourceType?.color });

  return (
    <div className="flex items-center space-x-2">
      <div className="rounded-full p-2">
        <ResourceIcon
          icon={resourceType?.icon}
          className={`${iconColor} h-7 w-7`}
        />
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </div>
    </div>
  );
};
