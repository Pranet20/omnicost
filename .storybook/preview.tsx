// .storybook/preview.ts
import type { Preview } from "@storybook/react";
// 1. IMPORT OUR TAILWIND CSS
// Storybook's TypeScript configuration does not declare CSS side-effect imports.
// @ts-ignore -- the bundler resolves this stylesheet at runtime.
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // 2. FORCE STORYBOOK'S BACKGROUND TO MATCH OUR DARK COMMAND CENTER
    backgrounds: {
      default: 'omni-dark',
      values: [
        { name: 'omni-dark', value: '#0B0F19' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
};

export default preview;