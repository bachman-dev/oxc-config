import type { UiFramework } from "../types.ts";
import type { OxfmtUiFrameworkMetadata } from "./types.ts";

const astro: OxfmtUiFrameworkMetadata = {
  name: "Astro",
  settings: {
    astro: {
      setting: {
        allowShorthand: true,
        compressHTML: "jsx",
        skipFrontmatter: false,
      },
      explanation: [
        "`allowShorthand: true` mirrors the `object-shorthand` oxlint rule, so `{title}` is preferred over `title={title}`",
        "`compressHTML: \"jsx\"` is oxfmt's default; change it if your project changes Astro's own `compressHTML` setting",
        "`skipFrontmatter: false` so the frontmatter is formatted like any other TypeScript",
      ],
    },
  },
  admonishments: [
    {
      type: "important",
      text: "Oxfmt formats Astro components with `prettier-plugin-astro`, which needs the `@astrojs/compiler-rs` package installed in your project; formatting `.astro` files fails without it.",
    },
  ],
};

const uiFrameworks: Record<UiFramework, OxfmtUiFrameworkMetadata> = {
  astro,
};

export default uiFrameworks;
