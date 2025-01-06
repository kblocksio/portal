import React from "react";
import { KeyValueList } from "@/components/resource-key-value-list";
import { resolvePropertyField } from "./resource-outputs/properties-resolver";
import type { Resource } from "@kblocks-portal/server";

export default function Properties({
  outputs,
  resource,
  isProperties = false,
}: {
  outputs: Record<string, any>;
  resource: Resource;
  isProperties?: boolean;
}) {
  const keys = Object.keys(outputs);
  if (keys.length === 0) {
    return null;
  }

  const uiComponents: JSX.Element[] = [];
  const nonUiComponents: Record<string, any> = {};
  for (const key of keys) {
    const schema = !isProperties
      ? resource.type?.schema.properties.status?.properties?.[key]
      : resource.type?.schema.properties?.[key];
    const component = resolvePropertyField({
      schema: schema ?? {
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
      <KeyValueList resource={resource} properties={nonUiComponents} />
      {uiComponents.map((component, index) => (
        <React.Fragment key={index}>{component}</React.Fragment>
      ))}
    </>
  );
}
