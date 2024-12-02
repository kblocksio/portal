import { uiPickerParser } from "../resource-form/pickers/ui-picker-parser";
import SwaggerUIComponent from "./components/swagger-ui";
import HiddenComponent from "./components/hidden-component";
import { Shell } from "../resource-form/pickers/shell";
import { PropertyKey, PropertyValue } from "../ui/property";
import { MarkdownWrapper } from "../markdown";

export const resolveOutputField = ({
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
            <MarkdownWrapper content={value} />
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
