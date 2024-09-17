import type { MetaFunction } from "@remix-run/node";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { CatalogSidebar } from "~/components/catalog/catalog-sidebar";
import { Outlet, useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";

export const loader = async () => {
  // const response = await fetch("/api/api-groups");
  // const data = await response.json();
  // return data;
  return json({
    apiGroups: [],
  });
};

export default function Index() {
  const [apiGroups, setApiGroups] = useState<any[]>([]);
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!data) return;
    setApiGroups(data.apiGroups);
  }, [data]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} minSize={20} collapsible>
        <div className="h-full overflow-y-auto">
          <div className="p-2">
            <CatalogSidebar apiGroups={apiGroups} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
