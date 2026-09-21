import type { OxlintRuleGroup } from "../types.ts";

const promise: OxlintRuleGroup = {
  name: "Promise Rules",
  plugin: "promise",
  description: "Rules ported from `eslint-plugin-promise` that enforce best practices for JavaScript Promises",
  correctness: {
    // All default as of oxlint 1.82.0
  },
  suspicious: {
    "promise/always-return": {
      settings: ["error", { ignoreAssignmentVariable: ["globalThis"], ignoreLastCallback: false }],
    },
    "promise/no-multiple-resolved": {
      settings: "error",
    },
    "promise/no-promise-in-callback": {
      settings: ["error", { exemptDeclarations: false }],
    },
  },
  restriction: {
    "promise/catch-or-return": {
      settings: ["error", { allowFinally: true, allowThen: false, allowThenStrict: false, terminationMethod: [] }],
    },
    "promise/spec-only": {
      settings: ["error", { allowedMethods: [] }],
    },
  },
  perf: {
    // None as of oxlint 1.82.0
  },
  pedantic: {
    // None as of oxlint 1.82.0
  },
  style: {
    "promise/avoid-new": {
      settings: "error",
    },
    "promise/no-nesting": {
      settings: "error",
    },
    "promise/no-return-wrap": {
      settings: ["error", { allowReject: false }],
    },
    "promise/param-names": {
      settings: ["error", { rejectPattern: "^_?reject$", resolvePattern: "^_?resolve$" }],
    },
    "promise/prefer-await-to-callbacks": {
      settings: "error",
    },
    "promise/prefer-await-to-then": {
      settings: ["error", { strict: true }],
    },
    "promise/prefer-catch": {
      settings: "error",
    },
  },
  nursery: {
    "promise/no-return-in-finally": {
      settings: "warn",
    },
  },
};

export default promise;
