import type { OxlintRuleGroup } from "../types.ts";
import { typeScriptDeclarationFiles } from "../utils.ts";

const importRules: OxlintRuleGroup = {
  name: "Import/Export Declaration Rules",
  plugin: "import",
  description:
    "Rules ported from `eslint-plugin-import` that help with creating safe and style-compliant `import` and `export` declarations",
  correctness: {
    // All default as of oxlint 1.82.0
  },
  suspicious: {
    "import/no-absolute-path": {
      settings: ["error", { amd: false, commonjs: false, esmodule: true }],
    },
    "import/no-named-as-default": {
      settings: "error",
    },
    "import/no-named-as-default-member": {
      settings: "error",
    },
    "import/no-self-import": {
      settings: "error",
    },
  },
  restriction: {
    "import/extensions": {
      settings: [
        "error",
        "ignorePackages",
        { checkTypeImports: true, ignorePackages: true, pathGroupOverrides: [], pattern: {} },
      ],
    },
    "import/no-amd": {
      settings: "error",
    },
    "import/no-commonjs": {
      settings: ["error", { allowConditionalRequire: false, allowPrimitiveModules: false, allowRequire: false }],
    },
    "import/no-cycle": {
      settings: ["error", { allowUnsafeDynamicCyclicDependency: false, ignoreExternal: false, ignoreTypes: true }],
    },
    "import/no-dynamic-require": {
      settings: ["error", { esmodule: true }],
    },
    "import/no-webpack-loader-syntax": {
      settings: "error",
    },
    "import/unambiguous": {
      settings: "error",
      override: {
        files: typeScriptDeclarationFiles,
        settings: "off",
      },
    },
  },
  perf: {
    // None as of oxlint 1.82.0
  },
  pedantic: {
    // None set as of oxlint 1.82.0
  },
  style: {
    "import/consistent-type-specifier-style": {
      settings: ["error", "prefer-top-level-if-only-type-imports"],
    },
    "import/exports-last": {
      settings: "error",
    },
    "import/first": {
      settings: ["error", "disable-absolute-first"],
    },
    "import/no-anonymous-default-export": {
      settings: [
        "error",
        {
          allowAnonymousClass: false,
          allowAnonymousFunction: false,
          allowArray: false,
          allowArrowFunction: false,
          allowCallExpression: true,
          allowLiteral: false,
          allowNew: false,
          allowObject: false,
        },
      ],
    },
    "import/no-duplicates": {
      settings: ["error", { considerQueryString: false, preferInline: true }],
    },
    "import/no-mutable-exports": {
      settings: "error",
    },
    "import/no-named-default": {
      settings: "error",
    },
    "import/prefer-default-export": {
      settings: ["error", { target: "single" }],
    },
  },
  nursery: {
    "import/export": {
      settings: "warn",
    },
    "import/named": {
      settings: "warn",
    },
  },
};

export default importRules;
