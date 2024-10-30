import toast, { ToastBar, Toaster } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
export const AppToaster = () => {
  const navigate = useNavigate();

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

  return (
    <Toaster position="bottom-right" toastOptions={{ duration: Infinity }}>
      {(t) => (
        <ToastBar toast={t} style={{ overflowX: "auto", maxWidth: "700px" }}>
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
  );
};
