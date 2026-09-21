import type { OxlintRuleGroup } from "../types.ts";
import { testFiles as files } from "../utils.ts";

const additionalTestBlockFunctions = ["testFor"];

const vitest: OxlintRuleGroup = {
  name: "Vitest Rules",
  plugin: "vitest",
  description:
    "Rules that enforce best practices for writing tests using Vitest, scoped only to test files in a codebase",
  admonishments: [
    {
      type: "important",
      text: `For multiple rules, we also check for the following function(s) as a test block to allow loading of fixtures into the test suite if needed:\n\n${additionalTestBlockFunctions.map((block) => `- ${block}`).join("\n")}\n\nMake sure to use these names so that test-block-sensitive rules fire correctly.`,
    },
  ],
  correctness: {
    "vitest/expect-expect": {
      settings: "off",
      override: {
        files,
        settings: [
          "error",
          {
            additionalTestBlockFunctions,
            assertFunctionNames: ["expect", "expectTypeOf", "assert", "assertType"],
          },
        ],
      },
    },
    "vitest/hoisted-apis-on-top": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-conditional-expect": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-conditional-tests": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-disabled-tests": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-focused-tests": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-standalone-expect": {
      settings: "off",
      override: {
        files,
        settings: ["error", { additionalTestBlockFunctions }],
      },
    },
    "vitest/prefer-snapshot-hint": {
      settings: "off",
      override: {
        files,
        settings: ["error", "multi"],
      },
    },
    "vitest/require-awaited-expect-poll": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/require-local-test-context-for-concurrent-snapshots": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/require-mock-type-parameters": {
      settings: "off",
      override: {
        files,
        settings: ["error", { checkImportFunctions: true }],
      },
    },
    "vitest/require-to-throw-message": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/valid-describe-callback": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/valid-expect": {
      settings: "off",
      override: {
        files,
        settings: ["error", { alwaysAwait: false, asyncMatchers: ["toResolve", "toReject"], maxArgs: 1, minArgs: 1 }],
      },
    },
    "vitest/valid-expect-in-promise": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/valid-title": {
      settings: "off",
      override: {
        files,
        settings: [
          "error",
          {
            ignoreTypeOfDescribeName: false,
            allowArguments: false,
            disallowedWords: [],
          },
        ],
      },
    },
    "vitest/warn-todo": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
  },
  suspicious: {
    "vitest/no-commented-out-tests": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
  },
  restriction: {
    "vitest/require-test-timeout": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
  },
  perf: {
    // None as of oxlint 1.82.0
  },
  pedantic: {
    "vitest/no-conditional-in-test": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
  },
  style: {
    "vitest/consistent-each-for": {
      settings: "off",
      override: {
        files,
        settings: ["error", { describe: "for", it: "for", suite: "for", test: "for" }],
      },
    },
    "vitest/consistent-test-filename": {
      settings: [
        "error",
        { allTestPattern: "\\.(?:test|spec)(?:-d)?\\.[cm]?[jt]sx?$", pattern: "\\.test(?:-d)?\\.(?:[cm]?ts|tsx)$" },
      ],
    },
    "vitest/consistent-test-it": {
      settings: "off",
      override: {
        files,
        settings: ["error", { fn: "test", withinDescribe: "it" }],
      },
    },
    "vitest/consistent-vitest-vi": {
      settings: "off",
      override: {
        files,
        settings: ["error", { fn: "vi" }],
      },
    },
    "vitest/max-expects": {
      settings: "off",
      override: {
        files,
        settings: ["error", { max: 5 }],
      },
    },
    "vitest/max-nested-describe": {
      settings: "off",
      override: {
        files,
        settings: ["error", { max: 3 }],
      },
    },
    "vitest/no-alias-methods": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-duplicate-hooks": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-hooks": {
      settings: "off",
      override: {
        files,
        settings: ["error", { allow: ["afterAll", "beforeAll"] }],
      },
    },
    "vitest/no-identical-title": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-import-node-test": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-interpolation-in-snapshots": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-large-snapshots": {
      settings: "off",
      override: {
        files,
        settings: ["error", { allowedSnapshots: {}, maxSize: 50 }],
      },
    },
    "vitest/no-mocks-import": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-test-prefixes": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-test-return-statement": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/no-unneeded-async-expect-function": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-called-exactly-once-with": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-called-once": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-called-with": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-describe-function-title": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-each": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-equality-matcher": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-expect-assertions": {
      settings: "off",
      override: {
        files,
        settings: [
          "error",
          {
            onlyFunctionsWithAsyncKeyword: true,
            onlyFunctionsWithExpectInCallback: true,
            onlyFunctionsWithExpectInLoop: true,
          },
        ],
      },
    },
    "vitest/prefer-expect-resolves": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-expect-type-of": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-hooks-in-order": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-hooks-on-top": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-import-in-mock": {
      settings: "off",
      override: {
        files,
        settings: ["error", { fixable: true }],
      },
    },
    "vitest/prefer-importing-vitest-globals": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-lowercase-title": {
      settings: "off",
      override: {
        files,
        settings: [
          "error",
          { allowedPrefixes: [], ignore: [], ignoreTopLevelDescribe: true, lowercaseFirstCharacterOnly: true },
        ],
      },
    },
    "vitest/prefer-mock-promise-shorthand": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-mock-return-shorthand": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-spy-on": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-strict-boolean-matchers": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-strict-equal": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-to-be": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-to-be-object": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-to-contain": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-to-have-been-called-times": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-to-have-length": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/prefer-todo": {
      settings: "off",
      override: {
        files,
        settings: "error",
      },
    },
    "vitest/require-top-level-describe": {
      settings: "off",
      override: {
        files,
        settings: ["error", { maxNumberOfTopLevelDescribes: 100 }],
      },
    },
  },
};

export default vitest;
