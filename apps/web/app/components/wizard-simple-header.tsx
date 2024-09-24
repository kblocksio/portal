import { ResourceType } from "@repo/shared";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { CardTitle, CardDescription } from "./ui/card";

export interface WizardSimpleHeaderProps {
  title: string;
  description: string;
  resourceType: ResourceType;
}

export const WizardSimpleHeader = ({ title, description, resourceType }: WizardSimpleHeaderProps) => {

  const ResourceIcon = getIconComponent({ icon: resourceType?.icon });
  const iconColor = getResourceIconColors({ color: resourceType?.color });


  return (
    <div className="flex items-center space-x-2">
      <div className="rounded-full p-2">
        <ResourceIcon
          className={`${iconColor} h-7 w-7`}
        />
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">
          {description}
        </CardDescription>
      </div>
    </div>
  );
};
