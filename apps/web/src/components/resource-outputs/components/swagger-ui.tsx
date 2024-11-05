import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyKey, PropertyValue } from "@/components/ui/property";
import { SwaggerUIDialog } from "@/components/resource-outputs/components/swagger-ui-dialog";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerUIComponent({ spec }: { spec: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="items-center grid auto-rows-[28px] grid-cols-[auto_1fr]">
      <PropertyKey>Open API Spec</PropertyKey>
      <PropertyValue>
        <Button variant="ghost" onClick={() => {
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
