import type { OxfmtConfigMetaData } from "./types.ts";

const settings: OxfmtConfigMetaData = {
  arrowParens: {
    setting: "always",
    explanation: "Promotes consistent arrow function style",
  },
  bracketSameLine: {
    setting: false,
    explanation: "Makes for clean-looking HTML(esque) tags",
  },
  bracketSpacing: {
    setting: true,
    explanation: "Ensures that object literals are easy to read when printed on one line",
  },
  embeddedLanguageFormatting: {
    setting: "auto",
    explanation: "Code examples in Markdown end up well-formatted",
  },
  endOfLine: {
    setting: "lf",
    explanation:
      "Complies with UNIX-like OS conventions, and ensures Windows development doesn't use incorrect line endings",
  },
  experimentalOperatorPosition: {
    setting: "end",
    explanation: 'Logical operations read more naturally (eg "if... AND"',
  },
  htmlWhitespaceSensitivity: {
    setting: "css",
    explanation: "Prevents HTML rendering issues",
  },
  ignorePatterns: {
    setting: ["dist/**"],
    explanation: "Sensible default for most Bachman Dev projects which build to a dist folder",
    admonishments: [
      {
        type: "tip",
        text: "You can specify additional ignore patterns by passing this option as part of your own configuration object (see installation instructions).",
      },
    ],
  },
  insertFinalNewline: {
    setting: true,
    explanation: "POSIX compliance where tools expect files to end with a newline",
  },
  jsdoc: {
    setting: {
      addDefaultToDescription: false,
      bracketSpacing: false,
      capitalizeDescriptions: true,
      commentLineStrategy: "singleLine",
      descriptionTag: false,
      descriptionWithDot: false,
      keepUnparsableExampleIndent: false,
      lineWrappingStyle: "greedy",
      preferCodeFences: true,
      separateReturnsFromParam: false,
      separateTagGroups: false,
    },
    explanation: [
      "`addDefaultToDescription: false` as default values belong in the function signature; the `jsdoc/no-defaults` oxlint rule bans the `[name=default]` syntax this option reads from",
      "`bracketSpacing: false` keeps parameter specifications compact",
      "`capitalizeDescriptions: true` is a grammatical choice, as our descriptions are often sentences/paragraphs",
      '`commentLineStrategy: "singleLine"` keeps the comments compact',
      "`descriptionTag: false` as we prefer plain paragraphs instead of using a tag for our descriptions",
      "`descriptionWithDot: false` so as to not clash with a default parameter if present",
      "`keepUnparsableExampleIndent: false` to help call out syntax issues in code examples",
      '`lineWrappingStyle: "greedy"` to help keep documentation compact and concise',
      "`preferCodeFences: true` for consistent code examples even when a language isn't specified",
      "`separateReturnsFromParam: false` and `separateTagGroups: false` to help keep the documentation compact",
    ],
  },
  jsxSingleQuote: {
    setting: false,
    explanation: "Use double quotes when possible consistent with the rest of a project",
  },
  objectWrap: {
    setting: "preserve",
    explanation: "Allows for multi-line objects when intended to be human-readable",
    admonishments: [
      {
        type: "tip",
        text: "If you wish to have an object (e.g. a JSON file) kept to one line, either ignore the file completely using [ignorePatterns](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#ignorepatterns), or specify [overrides](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#overrides) to collapse it if it will fit within the print width",
      },
    ],
  },
  overrides: {
    setting: [],
    explanation: "Overrides are usually set at the project level",
    admonishments: [
      {
        type: "tip",
        text: "You can specify project-specific overrides by passing this option as part of your own configuration object (see installation instructions).",
      },
    ],
  },
  printWidth: {
    setting: 120,
    explanation: "Prevents excessive line wraps and is suitable for modern widescreen displays",
  },
  proseWrap: {
    setting: "preserve",
    explanation: "Leans on soft-wraps in the editor while allowing for hard-wraps when needed such as blockquotes",
  },
  quoteProps: {
    setting: "as-needed",
    explanation: "Keeps object property names neat while allowing for quotes on the rare occasion it is needed",
  },
  semi: {
    setting: true,
    explanation: "Provides a visual indicator for the end of a statement in JavaScript",
  },
  singleAttributePerLine: {
    setting: true,
    explanation: "Makes HTML(esque) attributes readable without excessive scrolling",
  },
  singleQuote: {
    setting: false,
    explanation: "Generally requires less escaping (e.g. apostrophes) vs the need to escape double quotes",
  },
  sortImports: {
    setting: {
      customGroups: [],
      groups: [
        "side_effect",
        { newlinesBetween: true },

        "wildcard-builtin",
        "builtin",
        { newlinesBetween: true },

        "wildcard-external",
        "external",
        { newlinesBetween: true },

        ["wildcard-internal", "wildcard-subpath"],
        ["internal", "subpath"],
        { newlinesBetween: true },

        // TODO: Split apart if we ever want parent, sibling, index ordering.
        ["wildcard-parent", "wildcard-sibling", "wildcard-index"],
        ["parent", "sibling", "index"],
        { newlinesBetween: true },

        "style",
        "unknown",
      ],
      // TODO: verify direction if/when sortBy is implemented
      ignoreCase: false,
      internalPattern: ["~/", "@/", "#"],
      newlinesBetween: false,
      order: "asc",
      partitionByComment: false,
      partitionByNewline: false,
      // TODO: Uncomment once oxfmt ports perfectionist's sortBy (oxc#20006).
      // sortBy: "specifier",
      sortSideEffects: false,
    },
    explanation: [
      "No custom groups currently",
      "We group the imports into side-effects, built-ins, external packages, internal packages, and file path imports; style and unknown type imports are put at the bottom",
      "`ignoreCase: false` to avoid blending upper and lowercase imports",
      "`newlinesBetween: false` at the top level so that we only separate the bundles of groups instead of each individual group with a newline",
      '`order: "asc"` to sort alphabetically from A-Z',
      "`partitionByComment: false` and `partitionByNewline: false` as we don't want to use partitions to affect sorting",
      "`sortSideEffects: false` for security purposes",
    ],
    admonishments: [
      {
        type: "important",
        text: "Currently oxfmt does not support using the import *specifiers* as a sort key within the groups -- only the path. Should this feature land in a future oxfmt update, we intend to use the specifier as the sort key. In the meantime, we rely on the `eslint/sort-imports` oxlint rule to call out and help sort the specifiers as best we can.",
      },
    ],
  },
  sortPackageJson: {
    setting: {
      sortScripts: true,
    },
    explanation: "Keeps package information organized, including script names",
  },
  sortTailwindcss: {
    setting: false,
    explanation: "Generally set on a per-project basis",
    admonishments: [
      {
        type: "important",
        text: "When configuring a project that uses Tailwind, make sure to configure this in a configuration object passed to the method (see installation instructions), especially the `stylesheet` setting so oxfmt can find and manage your Tailwind CSS file.",
      },
    ],
  },
  svelte: {
    setting: false,
    explanation: "Generally set on a per-project basis",
    admonishments: [
      {
        type: "important",
        text: "We generally don't use Svelte in any of our projects; it may be a mistake to enable this configuration.",
      },
    ],
  },
  tabWidth: {
    setting: 2,
    explanation: "Generally accepted indentation by the industry",
  },
  trailingComma: {
    setting: "all",
    explanation: "Makes for cleaner Git diffs",
  },
  useTabs: {
    setting: false,
    explanation: "Spaces are displayed more consistently across editors and GitHub",
  },
  vueIndentScriptAndStyle: {
    setting: false,
    explanation: "Keeping consistency with other HTML-esque attributes",
  },
};

export default settings;
