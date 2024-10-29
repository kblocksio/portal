import { getResourceIconColors } from "@/lib/hero-icon";
import { CardTitle, CardDescription } from "./ui/card";
import { ResourceType } from "@/resource-context";

export interface WizardSimpleHeaderProps {
  title: string;
  description: string;
  resourceType: ResourceType;
}

export const WizardSimpleHeader = ({
  title,
  description,
  resourceType,
}: WizardSimpleHeaderProps) => {
  const ResourceIcon = resourceType?.iconComponent;
  const iconColor = getResourceIconColors({ color: resourceType?.color });

  return (
    <div className="flex items-center space-x-2">
      <div className="rounded-full p-2">
        <ResourceIcon className={`${iconColor} h-7 w-7`} />
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </div>
    </div>
  );
};
