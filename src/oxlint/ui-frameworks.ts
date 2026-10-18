import type { UiFramework } from "../types.ts";
import type { OxlintUiFrameworkMetadata } from "./types.ts";

const astro: OxlintUiFrameworkMetadata = {
  name: "Astro",
  description:
    "Oxlint lints the frontmatter and `<script>` tags of Astro components out of the box; these settings adjust the config to fit how Astro builds them.",
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
  rules: {
    "import/unambiguous": {
      settings: "off",
      explanation:
        "Astro always treats frontmatter and processed `<script>` tags as modules, even without any imports or exports",
    },
    "no-implicit-globals": {
      settings: "off",
      explanation:
        "Astro bundles processed `<script>` tags as modules, so their top-level declarations don't leak into the global scope",
    },
    "unicorn/filename-case": {
      settings: [
        "error",
        {
          // Oxlint uses `case` over `cases` when both are set, so only `cases` is set here
          cases: {
            camelCase: false,
            kebabCase: true,
            lowercase: false,
            pascalCase: true,
            screamingSnakeCase: false,
            snakeCase: false,
          },
          ignore: [],
          multipleFileExtensions: true,
        },
      ],
      explanation:
        "Astro components are conventionally named in PascalCase (eg `Layout.astro`), while pages stay in kebab-case since their names become URLs",
    },
  },
  admonishments: [
    {
      type: "note",
      text: "`<script>` tags with the `is:inline` directive aren't processed by Astro, so their top-level declarations do become globals; keep those scripts wrapped in a block or IIFE.",
    },
  ],
};

const uiFrameworks: Record<UiFramework, OxlintUiFrameworkMetadata> = {
  astro,
};

export default uiFrameworks;
