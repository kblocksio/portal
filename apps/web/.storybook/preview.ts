import type { Preview } from "@storybook/react";
import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";

import "../src/styles/tailwind.css";
import "../src/styles/global.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
    },
  },

  initialGlobals: {
    // viewport: { value: "mobile1", isRotated: false },
  },

  tags: ["autodocs"],
};

export default preview;
