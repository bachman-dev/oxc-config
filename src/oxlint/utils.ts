import type { DummyRuleMap, OxlintConfig, OxlintEnv, OxlintOverride } from "oxlint";

import type { LintPlugin, OverrideGlobSet, OxlintConfigOptions, OxlintRuleGroup, OxlintRuleMetadata } from "./types.ts";
import uiFrameworks from "./ui-frameworks.ts";

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

function getRulePlugin(rule: string): string {
  const separator = rule.indexOf("/");
  return separator === -1 ? "eslint" : rule.slice(0, separator);
}

function buildUiFrameworkOverrides(config: OxlintConfigOptions, baseRuleGroups: OxlintRuleGroup[]): OxlintOverride[] {
  const builtOverrides: OxlintOverride[] = [];
  const enabledPlugins = new Set<string>(baseRuleGroups.map((group) => group.plugin));
  // A Set drops duplicates, so listing a framework twice doesn't add its override twice
  for (const framework of new Set(config.uiFrameworks)) {
    const metadata = uiFrameworks[framework];
    const env: OxlintEnv = {};
    for (const [name, value] of Object.entries(metadata.env)) {
      env[name] = value.setting;
    }
    const rules: DummyRuleMap = {};
    for (const [rule, value] of Object.entries(metadata.rules)) {
      // Only adjust rules from plugins that are turned on, rather than switching a disabled plugin's rule back on
      if (typeof value !== "undefined" && enabledPlugins.has(getRulePlugin(rule))) {
        rules[rule] = value.settings;
      }
    }
    builtOverrides.push({ files: metadata.files.globs(config), env, rules });
  }
  return builtOverrides;
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
  // UI framework overrides come before the user's own, so the user can still override them per file
  builtOverrides.push(...buildUiFrameworkOverrides(config, baseRuleGroups));
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
  description: "test files when `vitest` is set to `true` (default) or an array of test file globs in the config",
  globs: (config) =>
    Array.isArray(config.vitest) ? config.vitest : ["**/*.test.{ts,tsx,mts,cts}", "**/*.test-d.{ts,tsx,mts,cts}"],
};
