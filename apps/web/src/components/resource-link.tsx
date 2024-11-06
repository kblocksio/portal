import { Resource, ResourceContext } from "@/resource-context";
import { getIconColors } from "@/lib/get-icon";
import { Link } from "./ui/link";
import { useContext } from "react";

export const ResourceLink = ({ resource, attribute }: { resource: Resource, attribute?: string }) => {
  const { resourceTypes } = useContext(ResourceContext);
  const selectedResourceType = resourceTypes[resource.objType];
  const Icon = selectedResourceType?.iconComponent;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {Icon && (
          <Icon
            className={`h-5 w-5 ${getIconColors({
              color: resource.color,
            })}`}
          />
        )}
      </div>
      <Link
        to={`/resources/${resource.objUri.replace("kblocks://", "")}` as any}
        onMouseEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        // className="underline"
      >
        <div className="text-md flex items-center gap-2">
          {resource.metadata.name}
        </div>
      </Link>
      {attribute && <span className="font-bold">{attribute}</span>}
    </div>
  );
};
