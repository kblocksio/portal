import { PropsWithChildren, useEffect } from "react";
import { AppProvider } from "./app-context";
import { UserProvider } from "./hooks/use-user";
import { ResourceProvider } from "./resource-context.js";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { CreateResourceWizardProvider } from "./create-resource-wizard-context.js";
import { useNavigate } from "@tanstack/react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar.js";
import { Separator } from "@/components/ui/separator.js";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb.js";
import { AppSidebar } from "./components/app-sidebar.js";

export function App(props: PropsWithChildren) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toast.dismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navigate = useNavigate();

  return (
    <AppProvider>
      <UserProvider>
        <ResourceProvider>
          <CreateResourceWizardProvider>
            <div className="flex min-h-screen flex-col">
              {/* <div className="fixed inset-x-0 top-0 z-10 h-14">
                <Header />
              </div> */}

              <SidebarProvider>
                <AppSidebar />

                <SidebarInset>
                  <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />
                      <Separator orientation="vertical" className="mr-2 h-4" />
                      <Breadcrumb>
                        <BreadcrumbList>
                          <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                              Building Your Application
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                  </header>
                  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                    {props.children}
                  </div>
                </SidebarInset>
              </SidebarProvider>

              <Toaster
                position="bottom-right"
                toastOptions={{ duration: Infinity }}
              >
                {(t) => (
                  <ToastBar
                    toast={t}
                    style={{ overflowX: "auto", maxWidth: "700px" }}
                  >
                    {({ icon, message }) => (
                      <div
                        className="flex items-center justify-between"
                        onClick={() => {
                          // navigate to the resource (id is expected to be the url for the resource
                          navigate({ to: t.id });
                          toast.dismiss(t.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            toast.dismiss(t.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {icon}
                        {message}
                      </div>
                    )}
                  </ToastBar>
                )}
              </Toaster>
            </div>
          </CreateResourceWizardProvider>
        </ResourceProvider>
      </UserProvider>
    </AppProvider>
  );
}

