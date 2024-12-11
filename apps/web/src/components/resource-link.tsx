import { getIconColors, ResourceIcon } from "@/lib/get-icon";
import { Link } from "./ui/link";
import type { Resource } from "@kblocks-portal/server";

export const ResourceLink = ({
  resource,
  attribute,
}: {
  resource: Resource;
  attribute?: string;
}) => {
  const selectedResourceType = resource.type;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <ResourceIcon
          icon={selectedResourceType?.icon}
          className={`h-5 w-5 ${getIconColors({
            color: resource.color,
          })}`}
        />
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
