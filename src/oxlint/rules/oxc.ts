import type { OxlintRuleGroup } from "../types.ts";

const oxc: OxlintRuleGroup = {
  name: "Oxc Rules",
  plugin: "oxc",
  description: "Rules created by the oxc project, some inspired by Rust's clippy linter",
  correctness: {
    // All default as of oxlint 1.82.0
  },
  suspicious: {
    "oxc/approx-constant": {
      settings: "error",
    },
    "oxc/misrefactored-assign-op": {
      settings: "error",
    },
    "oxc/no-this-in-exported-function": {
      settings: "error",
    },
  },
  restriction: {
    "oxc/bad-bitwise-operator": {
      settings: "error",
    },
    "oxc/no-barrel-file": {
      settings: ["error", { threshold: 100 }],
    },
    "oxc/no-const-enum": {
      settings: "error",
    },
  },
  perf: {
    "oxc/no-accumulating-spread": {
      settings: "error",
    },
    "oxc/no-map-spread": {
      settings: ["error", { ignoreArgs: true, ignoreRereads: true }],
    },
  },
  pedantic: {
    "oxc/branches-sharing-code": {
      settings: "error",
    },
  },
  style: {
    // None as of oxlint 1.82.0
  },
};

export default oxc;
