import type { UiFramework } from "../types.ts";
import type { OxlintUiFrameworkMetadata } from "./types.ts";

const astro: OxlintUiFrameworkMetadata = {
  name: "Astro",
  description: "Oxlint lints the frontmatter and `<script>` tags of Astro components out of the box.",
  files: {
    description: "Astro components",
    globs: () => ["**/*.astro"],
  },
  env: {
    astro: {
      setting: true,
      explanation: "Defines the `Astro` global that's available in component frontmatter",
    },
    browser: {
      setting: true,
      explanation: "Defines browser globals such as `document` for the client-side code in `<script>` tags",
    },
  },
};

const uiFrameworks: Record<UiFramework, OxlintUiFrameworkMetadata> = {
  astro,
};

export default uiFrameworks;
