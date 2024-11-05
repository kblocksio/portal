import { uiPickerParser } from "../resource-form/pickers/ui-picker-parser";
import SwaggerUIComponent from "./components/swagger-ui";
import HiddenComponent from "./components/hidden-component";

export const resolveOutputField = ({
  schema,
  value,
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
    case "cron-picker": // <-- meanwhile, just render as a normal field
    default: {
      return undefined;
    }
  }
};
