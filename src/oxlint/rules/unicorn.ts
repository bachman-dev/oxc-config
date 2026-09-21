import type { OxlintRuleGroup } from "../types.ts";
import { testFiles } from "../utils.ts";

const unicorn: OxlintRuleGroup = {
  name: "Unicorn Rules",
  plugin: "unicorn",
  description: "Powerful rules ported from `eslint-plugin-unicorn` for better code style and quality",
  correctness: {
    "unicorn/prefer-string-starts-ends-with": {
      settings: "off",
      admonishments: [
        {
          type: "note",
          text: "This rule is deprecated in favor of `typescript/prefer-string-starts-ends-with`, which is enabled in our TypeScript rules.",
        },
      ],
    },
  },
  suspicious: {
    "unicorn/consistent-function-scoping": {
      settings: ["error", { checkArrowFunctions: true }],
    },
    "unicorn/no-accessor-recursion": {
      settings: "error",
    },
    "unicorn/no-array-fill-with-reference-type": {
      settings: "error",
    },
    "unicorn/no-array-reverse": {
      settings: ["error", { allowExpressionStatement: true }],
    },
    "unicorn/no-array-sort": {
      settings: ["error", { allowAfterSpread: false, allowExpressionStatement: true }],
    },
    "unicorn/no-confusing-array-with": {
      settings: "error",
    },
    "unicorn/no-instanceof-builtins": {
      settings: ["error", { exclude: [], include: [], strategy: "strict", useErrorIsError: true }],
      admonishments: [
        {
          type: "tip",
          text: "Use a schema validation library that conforms to [Standard Schema](https://standardschema.dev/schema) for validating built-in types across your codebase.",
        },
      ],
    },
    "unicorn/prefer-add-event-listener": {
      settings: "error",
    },
    "unicorn/require-module-specifiers": {
      settings: "error",
    },
  },
  restriction: {
    "unicorn/import-style": {
      settings: [
        "error",
        {
          checkDynamicImport: true,
          checkExportFrom: false,
          checkImport: true,
          checkRequire: true,
          extendDefaultStyles: false,
          styles: {
            arktype: {
              named: true,
            },
            effect: {
              named: true,
            },
            fs: {
              namespace: true,
            },
            "fs/promises": {
              namespace: true,
            },
            "node:fs": {
              namespace: true,
            },
            "node:fs/promises": {
              namespace: true,
            },
            "node:path": {
              default: true,
            },
            "node:util": {
              named: true,
            },
            path: {
              default: true,
            },
            util: {
              named: true,
            },
            valibot: {
              namespace: true,
            },
            zod: {
              namespace: true,
            },
            "zod/mini": {
              namespace: true,
            },
          },
        },
      ],
      admonishments: [
        {
          type: "note",
          text: "We enforce import specifier consistency for some built-in utilities, as well as popular schema validation libraries. While I don't anticipate this rule being updated very often (only when we use a new library and consistent import specification is important), please note that a **minor** version update may see a new style added.",
        },
      ],
    },
    "unicorn/no-abusive-eslint-disable": {
      settings: "error",
    },
    "unicorn/no-array-for-each": {
      settings: "error",
    },
    "unicorn/no-array-reduce": {
      settings: ["error", { allowSimpleOperations: true }],
    },
    "unicorn/no-document-cookie": {
      settings: "error",
    },
    "unicorn/no-length-as-slice-end": {
      settings: "error",
    },
    "unicorn/no-magic-array-flat-depth": {
      settings: "error",
    },
    "unicorn/no-process-exit": {
      settings: "error",
    },
    "unicorn/no-useless-error-capture-stack-trace": {
      settings: "error",
    },
    "unicorn/prefer-modern-math-apis": {
      settings: "error",
    },
    "unicorn/prefer-module": {
      settings: "error",
    },
    "unicorn/prefer-node-protocol": {
      settings: "error",
    },
    "unicorn/prefer-number-properties": {
      settings: ["error", { checkInfinity: true, checkNaN: true }],
    },
  },
  perf: {
    "unicorn/prefer-array-flat-map": {
      settings: "error",
    },
    "unicorn/prefer-set-has": {
      settings: "error",
    },
  },
  pedantic: {
    "unicorn/consistent-assert": {
      settings: "error",
    },
    "unicorn/consistent-empty-array-spread": {
      settings: "error",
    },
    "unicorn/escape-case": {
      settings: "error",
    },
    "unicorn/explicit-length-check": {
      settings: ["error", { "non-zero": "greater-than" }],
    },
    "unicorn/new-for-builtins": {
      settings: "error",
    },
    "unicorn/no-hex-escape": {
      settings: "error",
    },
    "unicorn/no-immediate-mutation": {
      settings: "error",
    },
    "unicorn/no-lonely-if": {
      settings: "error",
    },
    "unicorn/no-negation-in-equality-check": {
      settings: "error",
    },
    "unicorn/no-new-buffer": {
      settings: "error",
    },
    "unicorn/no-object-as-default-parameter": {
      settings: "error",
    },
    "unicorn/no-static-only-class": {
      settings: "error",
    },
    "unicorn/no-this-assignment": {
      settings: "error",
    },
    "unicorn/no-unnecessary-array-flat-depth": {
      settings: "error",
    },
    "unicorn/no-unnecessary-array-splice-count": {
      settings: "error",
    },
    "unicorn/no-unnecessary-slice-end": {
      settings: "error",
    },
    "unicorn/no-unreadable-iife": {
      settings: "error",
    },
    "unicorn/no-useless-promise-resolve-reject": {
      settings: ["error", { allowReject: false }],
    },
    "unicorn/no-useless-switch-case": {
      settings: "error",
    },
    "unicorn/no-useless-undefined": {
      settings: ["error", { checkArguments: true, checkArrowFunctionBody: true }],
      override: {
        files: testFiles,
        settings: ["error", { checkArguments: false, checkArrowFunctionBody: true }],
      },
      admonishments: [
        {
          type: "note",
          text: "Arguments aren't checked in test files, where passing `undefined` explicitly can be meaningful (eg `expect(spy).toHaveBeenCalledWith(1, undefined)` fails for a call made with only `1`).",
        },
      ],
    },
    "unicorn/prefer-array-flat": {
      settings: "error",
    },
    "unicorn/prefer-array-some": {
      settings: "error",
    },
    "unicorn/prefer-at": {
      settings: ["error", { checkAllIndexAccess: false, getLastElementFunctions: [] }],
      admonishments: [
        {
          type: "note",
          text: "We don't check every index access, as `.at()` widens tuple element types (eg `pair.at(0)` on `[string, number]` is `string | number | undefined`); we assume TypeScript's `noUncheckedIndexedAccess` option already guards plain index access.",
        },
      ],
    },
    "unicorn/prefer-blob-reading-methods": {
      settings: "error",
    },
    "unicorn/prefer-code-point": {
      settings: "error",
    },
    "unicorn/prefer-date-now": {
      settings: "error",
    },
    "unicorn/prefer-dom-node-append": {
      settings: "error",
    },
    "unicorn/prefer-dom-node-dataset": {
      settings: "error",
    },
    "unicorn/prefer-dom-node-remove": {
      settings: "error",
    },
    "unicorn/prefer-event-target": {
      settings: "error",
    },
    "unicorn/prefer-import-meta-properties": {
      settings: "error",
    },
    "unicorn/prefer-math-min-max": {
      settings: "error",
    },
    "unicorn/prefer-math-trunc": {
      settings: "error",
    },
    "unicorn/prefer-native-coercion-functions": {
      settings: "error",
    },
    "unicorn/prefer-number-coercion": {
      settings: "error",
    },
    "unicorn/prefer-prototype-methods": {
      settings: "error",
    },
    "unicorn/prefer-query-selector": {
      settings: "error",
    },
    "unicorn/prefer-regexp-test": {
      settings: "error",
    },
    "unicorn/prefer-single-call": {
      settings: ["error", { ignore: [] }],
    },
    "unicorn/prefer-string-replace-all": {
      settings: "error",
    },
    "unicorn/prefer-string-slice": {
      settings: "error",
    },
    "unicorn/prefer-top-level-await": {
      settings: "error",
    },
    "unicorn/prefer-type-error": {
      settings: "error",
    },
    "unicorn/require-number-to-fixed-digits-argument": {
      settings: "error",
    },
  },
  style: {
    "unicorn/catch-error-name": {
      settings: ["error", { ignore: ["_error"], name: "error" }],
    },
    "unicorn/consistent-date-clone": {
      settings: "error",
    },
    "unicorn/consistent-existence-index-check": {
      settings: "error",
    },
    "unicorn/consistent-template-literal-escape": {
      settings: "error",
    },
    "unicorn/custom-error-definition": {
      settings: "error",
    },
    "unicorn/error-message": {
      settings: "error",
    },
    "unicorn/explicit-timer-delay": {
      settings: ["error", "always"],
    },
    "unicorn/filename-case": {
      settings: [
        "error",
        {
          case: "kebabCase",
          cases: {
            camelCase: false,
            kebabCase: true,
            lowercase: false,
            pascalCase: false,
            screamingSnakeCase: false,
            snakeCase: false,
          },
          ignore: [],
          multipleFileExtensions: true,
        },
      ],
    },
    "unicorn/max-nested-calls": {
      settings: ["error", { max: 5 }],
    },
    "unicorn/no-array-method-this-argument": {
      settings: "error",
    },
    "unicorn/no-await-expression-member": {
      settings: "error",
    },
    "unicorn/no-console-spaces": {
      settings: "error",
    },
    "unicorn/no-unreadable-array-destructuring": {
      settings: "error",
    },
    "unicorn/no-useless-collection-argument": {
      settings: "error",
    },
    "unicorn/no-zero-fractions": {
      settings: "error",
    },
    "unicorn/numeric-separators-style": {
      settings: [
        "error",
        {
          binary: { groupLength: 4, minimumDigits: 9, onlyIfContainsSeparator: false },
          hexadecimal: { groupLength: 2, minimumDigits: 7, onlyIfContainsSeparator: false },
          number: { fractionGroupLength: 20, groupLength: 3, minimumDigits: 5, onlyIfContainsSeparator: false },
          octal: { groupLength: 4, minimumDigits: 6, onlyIfContainsSeparator: false },
          onlyIfContainsSeparator: false,
        },
      ],
    },
    "unicorn/prefer-array-index-of": {
      settings: "error",
    },
    "unicorn/prefer-bigint-literals": {
      settings: "error",
    },
    "unicorn/prefer-class-fields": {
      settings: "error",
    },
    "unicorn/prefer-classlist-toggle": {
      settings: "error",
    },
    "unicorn/prefer-default-parameters": {
      settings: "error",
    },
    "unicorn/prefer-dom-node-text-content": {
      settings: "error",
    },
    "unicorn/prefer-export-from": {
      settings: ["error", { checkUsedVariables: true }],
    },
    "unicorn/prefer-global-this": {
      settings: "error",
    },
    "unicorn/prefer-keyboard-event-key": {
      settings: "error",
    },
    "unicorn/prefer-logical-operator-over-ternary": {
      settings: "error",
    },
    "unicorn/prefer-modern-dom-apis": {
      settings: "error",
    },
    "unicorn/prefer-negative-index": {
      settings: "error",
    },
    "unicorn/prefer-object-from-entries": {
      settings: ["error", { functions: [] }],
    },
    "unicorn/prefer-optional-catch-binding": {
      settings: "error",
    },
    "unicorn/prefer-reflect-apply": {
      settings: "error",
    },
    "unicorn/prefer-response-static-json": {
      settings: "error",
    },
    "unicorn/prefer-spread": {
      settings: "error",
    },
    "unicorn/prefer-string-raw": {
      settings: "error",
    },
    "unicorn/prefer-string-trim-start-end": {
      settings: "error",
    },
    "unicorn/prefer-structured-clone": {
      settings: ["error", { functions: [] }],
    },
    "unicorn/prefer-ternary": {
      settings: ["error", "always"],
    },
    "unicorn/relative-url-style": {
      settings: ["error", "always"],
    },
    "unicorn/require-array-join-separator": {
      settings: "error",
    },
    "unicorn/require-module-attributes": {
      settings: "error",
    },
    "unicorn/switch-case-braces": {
      settings: ["error", "avoid"],
    },
    "unicorn/switch-case-break-position": {
      settings: "error",
    },
    "unicorn/text-encoding-identifier-case": {
      settings: ["error", { withDash: false }],
    },
    "unicorn/throw-new-error": {
      settings: "error",
    },
  },
  nursery: {
    "unicorn/no-useless-iterator-to-array": {
      settings: "warn",
    },
  },
};

export default unicorn;
