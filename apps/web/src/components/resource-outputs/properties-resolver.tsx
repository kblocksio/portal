import { uiPickerParser } from "../resource-form/pickers/ui-picker-parser";
import SwaggerUIComponent from "./components/swagger-ui";
import HiddenComponent from "./components/hidden-component";
import { Shell } from "../resource-form/pickers/shell";
import { PropertyKey, PropertyValue } from "../ui/property";
import { MarkdownWrapper } from "../markdown";

export const resolvePropertyField = ({
  schema,
  value,
  key,
}: {
  schema: any;
  value: any;
  key: string;
}) => {
  const { description } = schema;
  const uiPicker = uiPickerParser(description ?? "");

  switch (uiPicker?.type) {
    case "swagger-ui": {
      return <SwaggerUIComponent spec={value} />;
    }
    case "hidden": {
      return <HiddenComponent />;
    }
    case "shell": {
      return (
        <>
          <PropertyKey>{key}</PropertyKey>
          <PropertyValue>
            <Shell value={value} />
          </PropertyValue>
        </>
      );
    }
    case "markdown": {
      return (
        <>
          <PropertyKey>{key}</PropertyKey>
          <PropertyValue>
            <div className="prose prose-sm max-h-[650px] max-w-full overflow-auto rounded-md p-4">
              <MarkdownWrapper content={value} />
            </div>
          </PropertyValue>
        </>
      );
    }
    case "cron-picker": // <-- meanwhile, just render as a normal field
    default: {
      return undefined;
    }
  }
};
