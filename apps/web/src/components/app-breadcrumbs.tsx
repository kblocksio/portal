import { useAppContext } from "@/app-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export const AppBreadcrumbs = () => {
  const { breadcrumbs } = useAppContext();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={breadcrumb.url} asLink>
                  {breadcrumb.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
