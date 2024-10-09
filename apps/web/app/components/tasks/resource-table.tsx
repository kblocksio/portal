import { Resource } from "~/ResourceContext";
import { ResourceType } from "../../../../../packages/shared/src/types";
import { columnsForType } from "./components/columns"
import { DataTable } from "./components/data-table"

export function ResourceTable({ objects, resourceType }: { objects: Resource[], resourceType: ResourceType }) {
  return <DataTable data={objects.map(obj => ({ obj, type: resourceType }))} columns={columnsForType(resourceType)} />;
}
