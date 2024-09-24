import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface ResourceTypesCardsProps {
  filtereResources: any[];
  handleResourceSelect: (resource: any) => void;
}
export const ResourceTypesCards = ({ filtereResources, handleResourceSelect }: ResourceTypesCardsProps) => {
  return filtereResources.map((resource, index) => {
    const Icon = getIconComponent({ icon: resource.icon });
    const iconColor = getResourceIconColors({
      color: resource?.color,
    });
    return (
      <Card
        key={index}
        className="hover:bg-accent cursor-pointer max-h-[160px] flex flex-col justify-center"
        onClick={() => handleResourceSelect(resource)}
      >
        <CardHeader className="flex flex-row h-[50px] text-center border-b border-b-gray-200 items-center align-middle">
          <div className="w-full flex self-center items-center justify-center">
            <Icon className={`${iconColor} h-7 w-7`} />
          </div>
        </CardHeader>
        <CardContent className="flex p-2 flex-col h-[110px]">
          <CardTitle className="mb-2">{resource.kind}</CardTitle>
          <CardDescription>
            {resource.description ||
              "This is a mock description with a reasonable length to see how it looks like"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  });
}
