import { useState, useEffect, useRef, useMemo, useContext } from "react";
import { Button } from "../ui/button";
import { FileCode, Loader2 } from "lucide-react";
import { FieldRenderer } from "./field-renderer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ApiObject } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";
import { ResourceContext, ResourceType } from "@/resource-context";
import { SystemSelector } from "./system-selector";
import cloneDeep from "lodash.clonedeep";
import YamlButton from "../yaml-button";
export interface FormGeneratorProps {
  resourceType: ResourceType;
  isLoading: boolean;
  handleSubmit: (meta: ObjectMetadata, fields: any) => void;
  initialValues?: ApiObject;
  initialMeta?: Partial<ObjectMetadata>;
}

export const ResourceForm = ({
  resourceType,
  isLoading,
  handleSubmit,
  initialValues,
  initialMeta,
}: FormGeneratorProps) => {
  const { clusters } = useContext(ResourceContext);
  const isEnvironmentResourceType = resourceType.group === "kblocks.io";

  // create a clone of the schema and remove the status property (the outputs)
  const schema = useMemo(() => {
    const result = cloneDeep(resourceType.schema);
    delete result.properties?.status;
    return result;
  }, [resourceType]);

  const [formData, setFormData] = useState<any>(initialValues ?? {});
  const [system, setSystem] = useState(
    initialMeta?.system ??
      (isEnvironmentResourceType
        ? resourceType.systems.values().next().value
        : ""),
  );
  const [namespace, setNamespace] = useState(
    initialMeta?.namespace ?? "default",
  );
  const [name, setName] = useState<string>(initialMeta?.name ?? "");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isReadOnlyCluster = useMemo(() => {
    if (isEnvironmentResourceType) return false;
    const cluster = Object.values(clusters).find(
      (c) => c.metadata.name === system,
    );
    return cluster?.access === "read_only";
  }, [isEnvironmentResourceType, clusters, system]);

  // Focus on the name input when it's empty
  useEffect(() => {
    if (name.length === 0 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [name]);

  const metadataObject: ObjectMetadata = useMemo(
    () => ({
      name,
      namespace,
      system,
    }),
    [name, namespace, system],
  );

  const yamlObject = useMemo(() => {
    const obj = {
      apiVersion: `${resourceType.group}/${resourceType.version}`,
      kind: resourceType.kind,
      metadata: cloneDeep(metadataObject),
      ...cloneDeep(formData),
    };

    delete obj.status;
    delete obj.metadata?.system;
    delete obj.metadata?.generation;
    delete obj.metadata?.creationTimestamp;
    delete obj.metadata?.managedFields;
    delete obj.metadata?.resourceVersion;
    delete obj.metadata?.uid;
    delete obj.objUri;
    delete obj.objType;

    return obj;
  }, [metadataObject, formData, resourceType]);

  return (
    <form
      className="flex h-full flex-col"
      style={{
        marginBlockEnd: "0px",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const meta: ObjectMetadata = metadataObject;
        handleSubmit(meta, formData);
      }}
    >
      <div className="space-y-4 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 space-y-2 sm:col-span-1">
            <Label
              htmlFor="name"
              className={`${initialValues ? "opacity-50" : ""}`}
            >
              Name
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="name"
              placeholder="Resource name"
              disabled={!!initialValues}
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameInputRef}
              data-1p-ignore
            />
          </div>
          <div className="col-span-3 space-y-2 sm:col-span-1">
            <Label
              htmlFor="namespace"
              className={`${initialValues ? "opacity-50" : ""}`}
            >
              Namespace
              {!isEnvironmentResourceType && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              required={!isEnvironmentResourceType}
              id="namespace"
              placeholder="Namespace"
              disabled={!!initialValues || isEnvironmentResourceType}
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
          </div>
          <div className="col-span-3 space-y-2 sm:col-span-1">
            <Label
              htmlFor="system"
              className={`${initialValues ? "opacity-50" : ""}`}
            >
              Cluster
              {!isEnvironmentResourceType && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div className="relative">
              <SystemSelector
                resourceType={resourceType}
                disabled={!!initialValues || isEnvironmentResourceType}
                value={system}
                onChange={(value) => setSystem(value)}
                required={!isEnvironmentResourceType}
              />
              <input
                type="text"
                tabIndex={-1}
                required={!isEnvironmentResourceType}
                disabled={!!initialValues || isEnvironmentResourceType}
                value={system}
                onChange={() => {}}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  top: "12px",
                  left: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative m-0 flex-1 border-t p-0">
        <div className="pointer-events-none sticky left-0 right-0 top-0 h-6 bg-gradient-to-b from-white to-transparent"></div>
        <FieldRenderer
          objectMetadata={metadataObject}
          schema={schema}
          fieldName=""
          path=""
          formData={formData}
          updateFormData={setFormData}
          hideField={true}
        />
        <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
      </div>
      <div className="flex justify-between border-t border-gray-200 px-2 py-4 pt-4">
        <YamlButton object={yamlObject}>
          <Button
            type="button"
            variant="secondary"
            className="ml-auto mr-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FileCode className="h-4 w-4" />
            YAML
          </Button>
        </YamlButton>
        {!isReadOnlyCluster && (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialValues ? "Updating..." : "Creating..."}
              </>
            ) : initialValues ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        )}
      </div>
    </form>
  );
};
