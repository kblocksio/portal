import React from "react";
import { KeyValueList } from "@/components/resource-key-value-list";
import { ResourceType } from "@/resource-context";
import { resolveOutputField } from "./resource-outputs/output-resolver";
import { PropertyKey, PropertyValue } from "./ui/property";

export default function Outputs({
  outputs,
  resourceObjUri,
  resourceType,
}: {
  outputs: Record<string, any>;
  resourceObjUri: string;
  resourceType: ResourceType;
}) {
  const keys = Object.keys(outputs);
  if (keys.length === 0) {
    return null;
  }

  const uiComponents: JSX.Element[] = [];
  const nonUiComponents: Record<string, any> = {};
  for (const key of keys) {
    const component = resolveOutputField({
      schema: resourceType.schema.properties.status?.properties?.[key] ?? {
        type: "string",
      },
      value: outputs[key],
      key: key,
    });
    if (component) {
      uiComponents.push(component);
    } else {
      nonUiComponents[key] = outputs[key];
    }
  }

  return (
    <>
      <KeyValueList data={nonUiComponents} resourceObjUri={resourceObjUri} />
      {uiComponents.map((component, index) => (
        <React.Fragment key={index}>{component}</React.Fragment>
      ))}
    </>
  );
}
