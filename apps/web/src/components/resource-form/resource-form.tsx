import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "../ui/button";
import { FileCode, Loader2 } from "lucide-react";
import { FieldRenderer } from "./field-renderer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ApiObject } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";
import { ResourceType } from "@/resource-context";
import { SystemSelector } from "./system-selector";
import cloneDeep from "lodash.clonedeep";
import YamlButton from "../yaml-button";
export interface FormGeneratorProps {
  resourceType: ResourceType;
  isLoading: boolean;
  handleBack: () => void;
  handleSubmit: (meta: ObjectMetadata, fields: any) => void;
  initialValues?: ApiObject;
  initialMeta: Partial<ObjectMetadata>;
}

export const ResourceForm = ({
  resourceType,
  isLoading,
  handleBack,
  handleSubmit,
  initialValues,
  initialMeta,
}: FormGeneratorProps) => {
  // create a clone of the schema and remove the status property (the outputs)
  const schema = useMemo(() => {
    const result = cloneDeep(resourceType.schema);
    delete result.properties?.status;
    return result;
  }, [resourceType]);

  const [formData, setFormData] = useState<any>(initialValues ?? {});
  const [system, setSystem] = useState(initialMeta?.system ?? "");
  const [namespace, setNamespace] = useState(
    initialMeta?.namespace ?? "default",
  );
  const [name, setName] = useState<string>(initialMeta?.name ?? "");
  const nameInputRef = useRef<HTMLInputElement>(null);

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
      className="flex h-full flex-col overflow-hidden"
      style={{
        marginBlockEnd: "0px",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const meta: ObjectMetadata = metadataObject;
        handleSubmit(meta, formData);
      }}
    >
      <div className="ml-2 mr-2 space-y-4 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
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
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="namespace"
              className={`${initialValues ? "opacity-50" : ""}`}
            >
              Namespace
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="namespace"
              placeholder="Namespace"
              disabled={!!initialValues}
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="system">
              Cluster
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <SystemSelector
                resourceType={resourceType}
                disabled={!!initialValues}
                value={system}
                onChange={(value) => setSystem(value)}
                required={true}
              />
              <input
                type="text"
                tabIndex={-1}
                required
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
      <div className="relative m-0 flex-1 overflow-y-auto border-t p-0">
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
        <Button type="button" variant="outline" onClick={handleBack}>
          {!initialValues ? "Back" : "Cancel"}
        </Button>
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
      </div>
    </form>
  );
};
