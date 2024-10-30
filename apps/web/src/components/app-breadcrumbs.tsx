import { useAppContext } from "@/app-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import React from "react";

export const AppBreadcrumbs = () => {
  const { breadcrumbs } = useAppContext();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.name}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage key={index}>{breadcrumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={breadcrumb.url}
                  asLink
                  className={breadcrumb.url ? "" : "pointer-events-none"}
                >
                  {breadcrumb.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index !== breadcrumbs.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
