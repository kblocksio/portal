import type { MetaFunction } from "@remix-run/node";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { CatalogSidebar } from "~/components/catalog/catalog-sidebar";
import { Outlet, useLoaderData } from "@remix-run/react";
import axios from "axios";
import { ApiGroup } from "@repo/shared";
import { useEffect, useState } from "react";

axios.defaults.baseURL = "http://localhost:3001";

export const loader = async () => {
  const { data } = await axios.get(`/api/api-groups`);
  return data;
};

export default function Index() {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!data) return;
    setApiGroups(data);
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
