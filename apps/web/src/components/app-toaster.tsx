import toast, { ToastBar, Toaster, ToastOptions } from "react-hot-toast";
import { useEffect } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Link } from "@/components/ui/link";

export const appToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.dismiss(); // Dismiss any active toast
    return toast.success(<span className="truncate">{message}</span>, options);
  },
  error: (message: string, options?: ToastOptions) => {
    toast.dismiss(); // Dismiss any active toast
    return toast.error(<span className="truncate">{message}</span>, options);
  },
};

export const AppToaster = () => {
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
    <Toaster position="bottom-right" toastOptions={{ duration: 5000 }}>
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            maxWidth: "700px",
            margin: "10px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {({ icon, message }) => (
            <Link
              to={t.id as any}
              className="m-2 line-clamp-1 max-w-[700px] truncate"
            >
              <div
                className="flex items-center space-x-2"
                onClick={() => {
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
                {typeof icon === "function" ? (
                  icon
                ) : t.type === "error" ? (
                  <CircleX className="h-4 w-4 flex-shrink-0 text-red-500" />
                ) : (
                  <CircleCheck className="h-4 w-4 flex-shrink-0 text-green-500" />
                )}
                <div className="truncate">{message}</div>
              </div>
            </Link>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};
