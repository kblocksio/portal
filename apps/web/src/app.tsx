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
              <div className="flex min-h-screen">
                <SidebarProvider>
                  <AppSidebar />
                  <div className="flex flex-1 flex-col">
                    <header className="bg-background sticky top-0 z-50 flex h-16 items-center border-b transition-[height] duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                    <main className="flex-1 px-4 sm:px-6 lg:px-8">
                      <div className="mx-auto w-full max-w-screen-2xl py-4">
                        {props.children}
                      </div>
                    </main>
                  </div>
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
