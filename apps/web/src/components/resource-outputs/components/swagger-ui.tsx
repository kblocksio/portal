import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyKey, PropertyValue } from "@/components/ui/property";
import { SwaggerUIDialog } from "@/components/resource-outputs/components/swagger-ui-dialog";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerUIComponent({ spec }: { spec: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid auto-rows-[32px] grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
      <PropertyKey>Open API Spec</PropertyKey>
      <PropertyValue>
        <Button
          variant="outline"
          className="mt-auto h-full"
          onClick={() => {
            setOpen(true);
          }}
        >
          View
        </Button>
      </PropertyValue>
      <SwaggerUIDialog isOpen={open} onClose={() => setOpen(false)}>
        <SwaggerUI spec={spec} />
      </SwaggerUIDialog>
    </div>
  );
}
