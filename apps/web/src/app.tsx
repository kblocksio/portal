import { PropsWithChildren } from "react";
import { AppProvider } from "./app-context";
import { UserProvider } from "./hooks/use-user";
import { ResourceProvider } from "./resource-context.js";
import { CreateResourceWizardProvider } from "./create-resource-wizard-context.js";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar.js";
import { Separator } from "@/components/ui/separator.js";
import { AppSidebar } from "./components/app-sidebar.js";
import { AppBreadcrumbs } from "./components/app-breadcrumbs.js";
import { AppToaster } from "./components/app-toaster.js";
import { NotificationMenu } from "./components/notifications-menu.js";
import { NotificationsProvider } from "./notifications-context.js";

export function App(props: PropsWithChildren) {
  return (
    <AppProvider>
      <UserProvider>
        <NotificationsProvider>
          <ResourceProvider>
            <CreateResourceWizardProvider>
              <div className="flex min-h-screen flex-col">
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                      <div className="flex w-full items-center gap-2 px-4">
                        <div className="flex items-center gap-2">
                          <SidebarTrigger className="-ml-1" />
                          <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                          />
                          <AppBreadcrumbs />
                        </div>
                        <NotificationMenu className="ml-auto" />
                      </div>
                    </header>
                    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                      {props.children}
                    </div>
                  </SidebarInset>
                </SidebarProvider>
                <AppToaster />
              </div>
            </CreateResourceWizardProvider>
          </ResourceProvider>
        </NotificationsProvider>
      </UserProvider>
    </AppProvider>
  );
}
