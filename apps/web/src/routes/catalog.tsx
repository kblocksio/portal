import { createFileRoute } from "@tanstack/react-router";

import { useContext, useEffect, useState } from "react";
import {
  CatalogSidebar,
  SidebarBody,
  SidebarLabel,
} from "~/components/catalog/catalog-sidebar";
import { loadingStates } from "~/components/catalog/loading-states";
import { MultiStepLoader } from "~/components/ui/multi-step-loader";
import { getResourceIconColors } from "~/lib/hero-icon";
import { cn } from "~/lib/utils";
import { MarkdownWrapper } from "~/components/markdown";
import { ResourceContext, ResourceType } from "~/resource-context";
import { Button } from "~/components/ui/button";
import { ResourceTypeWizard } from "~/components/catalog/resource-type-wizard";

export const Route = createFileRoute("/catalog")({
  component: Catalog,
});

function Catalog() {
  const { isLoading, resourceTypes } = useContext(ResourceContext);
  const [currentResourceType, setCurrentResourceType] =
    useState<ResourceType | null>(null);
  const [isResourceTypeWizardOpen, setIsResourceTypeWizardOpen] =
    useState(false);

  useEffect(() => {
    if (resourceTypes) {
      setCurrentResourceType(Object.values(resourceTypes)[0]);
    }
  }, [resourceTypes]);

  return isLoading ? (
    <MultiStepLoader
      loadingStates={loadingStates}
      loading={isLoading}
      duration={1500} // 1.5 seconds mock progress
      loop={false}
      ready={!isLoading}
    />
  ) : (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row dark:bg-neutral-800",
        "h-full",
      )}
    >
      <ResourceTypeWizard
        isOpen={isResourceTypeWizardOpen}
        handleOnOpenChange={setIsResourceTypeWizardOpen}
      />
      <CatalogSidebar animate={false}>
        <SidebarBody className="bg-muted justify-between gap-10 border-r">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Button
              className="mb-4"
              variant="default"
              onClick={() => setIsResourceTypeWizardOpen(true)}
            >
              New Kblock...
            </Button>
            <div className="flex flex-col">
              {resourceTypes &&
                Object.values(resourceTypes).map((resourceType, idx) => {
                  const resourceTypeName = resourceType.kind;
                  const Icon = resourceType.iconComponent;
                  const iconColor = getResourceIconColors({
                    color: resourceType?.color,
                  });
                  return (
                    <SidebarLabel
                      key={idx}
                      label={resourceTypeName}
                      icon={
                        <Icon
                          className={`${iconColor} h-5 w-5 flex-shrink-0`}
                        />
                      }
                      onClick={() => setCurrentResourceType(resourceType)}
                      isActive={currentResourceType?.kind === resourceType.kind}
                    />
                  );
                })}
            </div>
          </div>
        </SidebarBody>
      </CatalogSidebar>
      <div className="bg-background flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Parent container wrapping both markdown and metadata */}
          <div className="flex h-full flex-1 flex-row overflow-auto">
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl p-2 text-left md:p-8 dark:border-neutral-700">
              {currentResourceType && (
                <MarkdownWrapper content={currentResourceType.readme || ""} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
