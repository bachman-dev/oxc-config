import type { OxlintRuleGroup } from "../types.ts";

const jsdoc: OxlintRuleGroup = {
  name: "JSDoc Rules",
  plugin: "jsdoc",
  description:
    "Rules ported from `eslint-plugin-jsdoc` to make sure code documentation looks good and conforms to best practices",
  correctness: {
    "jsdoc/check-tag-names": {
      settings: ["error", { definedTags: [], jsxTags: false, typed: true }],
    },
  },
  suspicious: {
    // None as of oxlint 1.82.0
  },
  restriction: {
    "jsdoc/check-access": {
      settings: "error",
    },
    "jsdoc/empty-tags": {
      settings: ["error", { tags: [] }],
    },
  },
  perf: {
    // None as of oxlint 1.82.0
  },
  pedantic: {
    "jsdoc/require-param": {
      settings: [
        "error",
        {
          checkConstructors: false,
          checkDestructured: true,
          checkDestructuredRoots: true,
          checkGetters: true,
          checkRestProperty: false,
          checkSetters: true,
          checkTypesPattern: "^(?:[oO]bject|[aA]rray|PlainObject|Generic(?:Object|Array))$",
          exemptedBy: ["inheritdoc"],
          ignoreWhenAllParamsMissing: false,
          interfaceExemptsParamsCheck: false,
          useDefaultObjectProperties: false,
        },
      ],
    },
    "jsdoc/require-param-description": {
      settings: [
        "error",
        { defaultDestructuredRootDescription: "The root object", setDefaultDestructuredRootDescription: false },
      ],
    },
    "jsdoc/require-param-name": {
      settings: "error",
    },
    "jsdoc/require-param-type": {
      settings: ["error", { defaultDestructuredRootType: "object", setDefaultDestructuredRootType: true }],
    },
    "jsdoc/require-returns": {
      settings: [
        "error",
        {
          checkConstructors: false,
          checkGetters: true,
          exemptedBy: ["inheritdoc"],
          forceRequireReturn: false,
          forceReturnsWithAsync: false,
        },
      ],
    },
    "jsdoc/require-returns-description": {
      settings: "error",
    },
    "jsdoc/require-returns-type": {
      settings: "error",
    },
    "jsdoc/require-throws-type": {
      settings: "error",
    },
    "jsdoc/require-yields-type": {
      settings: "error",
    },
  },
  style: {
    "jsdoc/no-blank-blocks": {
      settings: ["error", { enableFixer: true }],
    },
    "jsdoc/require-throws-description": {
      settings: "error",
    },
    "jsdoc/require-yields-description": {
      settings: "error",
    },
  },
};

export default jsdoc;
