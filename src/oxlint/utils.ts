import type { DummyRuleMap, OxlintConfig, OxlintOverride } from "oxlint";

import type { LintPlugin, OverrideGlobSet, OxlintConfigOptions, OxlintRuleGroup, OxlintRuleMetadata } from "./types.ts";

function hasSameGlobs(first?: string[], second?: string[]): boolean {
  if (typeof first === "undefined" || typeof second === "undefined") {
    return typeof first === "undefined" && typeof second === "undefined";
  }
  if (first.length !== second.length) {
    return false;
  }
  // Glob patterns are compared as sets; the order they're listed in doesn't matter
  const sortedFirst = [...first].toSorted();
  const sortedSecond = [...second].toSorted();
  return sortedFirst.every((glob, index) => glob === sortedSecond[index]);
}

function mergeRuleGroups(groups: OxlintRuleGroup[]): OxlintRuleMetadata {
  const RULE_CATEGORIES = [
    "correctness",
    "suspicious",
    "restriction",
    "perf",
    "pedantic",
    "style",
    "nursery",
  ] as const satisfies readonly (keyof OxlintRuleGroup)[];
  const merged: OxlintRuleMetadata = {};
  for (const group of groups) {
    for (const category of RULE_CATEGORIES) {
      const metadata = group[category];
      if (typeof metadata === "object") {
        Object.assign(merged, metadata);
      }
    }
  }
  return merged;
}

export function buildPlugins(baseRuleGroups: OxlintRuleGroup[], overrides?: OxlintConfig): LintPlugin[] {
  if (typeof overrides === "object" && Array.isArray(overrides.plugins)) {
    return [...baseRuleGroups.map((group) => group.plugin), ...overrides.plugins];
  }
  return baseRuleGroups.map((group) => group.plugin);
}

export function buildRules(baseRuleGroups: OxlintRuleGroup[], overrides?: OxlintConfig): DummyRuleMap {
  const rules: DummyRuleMap = {};
  const merged = mergeRuleGroups(baseRuleGroups);
  for (const [key, value] of Object.entries(merged)) {
    rules[key] = value.settings;
  }
  if (typeof overrides === "object" && typeof overrides.rules === "object") {
    for (const [key, value] of Object.entries(overrides.rules)) {
      rules[key] = value;
    }
  }
  return rules;
}

export function buildOverrides(
  config: OxlintConfigOptions,
  baseRuleGroups: OxlintRuleGroup[],
  overrides?: OxlintConfig,
): OxlintOverride[] {
  const builtOverrides: OxlintOverride[] = [];
  const mergedRules = mergeRuleGroups(baseRuleGroups);
  for (const [key, value] of Object.entries(mergedRules)) {
    if (typeof value.override === "object") {
      // Resolve up front so a glob function is only called once per rule override
      const files = value.override.files.globs(config);
      const excludeFiles = value.override.excludeFiles?.globs(config);
      let override = builtOverrides.find(
        (candidate) => hasSameGlobs(candidate.files, files) && hasSameGlobs(candidate.excludeFiles, excludeFiles),
      );
      if (typeof override === "undefined") {
        override = { files: [...files] };
        if (Array.isArray(excludeFiles)) {
          override.excludeFiles = [...excludeFiles];
        }
        builtOverrides.push(override);
      }
      override.rules ??= {};
      override.rules[key] = value.override.settings;
    }
  }
  if (typeof overrides === "object" && Array.isArray(overrides.overrides)) {
    builtOverrides.push(...overrides.overrides);
  }
  return builtOverrides;
}

export const allTypeScriptFilesHandledByTypeScript: OverrideGlobSet = {
  description: "all TypeScript files, as this is checked by the TypeScript compiler itself",
  globs: () => ["**/*.{ts,tsx,cts,mts}"],
};

export const allTypeScriptFilesNoUnreachable: OverrideGlobSet = {
  description:
    "all TypeScript files, as we assume that TypeScript was configured with the `allowUnreachableCode` option set to `false`",
  globs: () => ["**/*.{ts,tsx,cts,mts}"],
};

export const allTypeScriptFilesNoImpliedEval: OverrideGlobSet = {
  description: "all TypeScript files, as we use the `typescript/no-implied-eval` rule to lint them instead",
  globs: () => ["**/*.{ts,tsx,cts,mts}"],
};

export const allTypeScriptFilesDefaultCase: OverrideGlobSet = {
  description:
    "all TypeScript files, as the `typescript/switch-exhaustiveness-check` rule will make sure a default case is in place when needed",
  globs: () => ["**/*.{ts,tsx,cts,mts}"],
};

export const typeScriptDeclarationFiles: OverrideGlobSet = {
  description:
    "TypeScript declaration files, as ambient declarations (eg `declare module`) must not contain imports or exports",
  globs: () => ["**/*.d.{ts,cts,mts}"],
};

export const testFiles: OverrideGlobSet = {
  description: "test files when `vitest` is set to `true` or an array of test file globs in the config",
  globs: (config) =>
    Array.isArray(config.vitest) ? config.vitest : ["**/*.test.{ts,tsx,mts,cts}", "**/*.test-d.{ts,tsx,mts,cts}"],
};
