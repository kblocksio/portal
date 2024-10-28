import { PropsWithChildren, useEffect } from "react";
import { Header } from "~/components/header";
import { AppProvider } from "./app-context";
import { UserProvider } from "./hooks/use-user";
import { PortalSidebar } from "./components/portal-sidebar.js";
import { ResourceProvider } from "./resource-context.js";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { CreateResourceWizardProvider } from "./create-resource-wizard-context.js";
import { useNavigate } from "@tanstack/react-router";

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
              <div className="fixed inset-x-0 top-0 z-10 h-14">
                <Header />
              </div>
              <div className="bg-muted fixed bottom-0 top-0 w-16 border-r">
                <div className="pt-14">
                  <PortalSidebar />
                </div>
              </div>
              <div className="pl-16 pt-14">{props.children}</div>
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
