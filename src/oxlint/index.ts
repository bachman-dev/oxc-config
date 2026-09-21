import type { OxlintConfig } from "oxlint";

import { eslint, importRules, jsdoc, oxc, promise, typescript, unicorn, vitest } from "./rules/index.ts";
import type { OxlintConfigOptions, OxlintRuleGroup } from "./types.ts";
import { buildOverrides, buildPlugins, buildRules } from "./utils.ts";

function buildBaseRuleGroups(options: OxlintConfigOptions): OxlintRuleGroup[] {
  const baseRuleGroups: OxlintRuleGroup[] = [];
  if (typeof options.eslint === "undefined" || options.eslint) {
    baseRuleGroups.push(eslint);
  }
  if (typeof options.import === "undefined" || options.import) {
    baseRuleGroups.push(importRules);
  }
  if (typeof options.jsdoc === "undefined" || options.jsdoc) {
    baseRuleGroups.push(jsdoc);
  }
  if (typeof options.oxc === "undefined" || options.oxc) {
    baseRuleGroups.push(oxc);
  }
  if (typeof options.promise === "undefined" || options.promise) {
    baseRuleGroups.push(promise);
  }
  if (typeof options.typescript === "undefined" || options.typescript) {
    baseRuleGroups.push(typescript);
  }
  if (typeof options.unicorm === "undefined" || options.unicorm) {
    baseRuleGroups.push(unicorn);
  }
  if (options.vitest === true || Array.isArray(options.vitest)) {
    baseRuleGroups.push(vitest);
  }
  return baseRuleGroups;
}

export default function bachmanDevConfig(userOptions?: OxlintConfigOptions, overrides?: OxlintConfig): OxlintConfig {
  const options: OxlintConfigOptions = userOptions ?? {
    eslint: true,
    import: true,
    jsdoc: true,
    oxc: true,
    promise: true,
    typescript: true,
    unicorm: true,
    vitest: true,
  };
  const config: OxlintConfig = {
    categories: {
      correctness: "error",
      ...overrides?.categories,
    },
    options: {
      typeAware: true,
      typeCheck: true,
      ...overrides?.options,
    },
    env: {
      es2025: true,
      ...overrides?.env,
    },
    globals: {
      ...overrides?.globals,
    },
  };

  const ourSettings: OxlintConfig["settings"] = {};
  if (typeof options.jsdoc === "undefined" || options.jsdoc) {
    ourSettings.jsdoc = {
      augmentsExtendsReplacesDocs: false,
      exemptDestructuredRootsFromChecks: false,
      ignoreInternal: false,
      ignorePrivate: false,
      ignoreReplacesDocs: true,
      implementsReplacesDocs: false,
      overrideReplacesDocs: true,
      tagNamePreference: {
        augments: {
          message: "@extends should be used over @augments as it is more evocative of classes and interfaces",
          replacement: "extends",
        },
      },
    };
  }
  if (options.vitest === true || Array.isArray(options.vitest)) {
    ourSettings.vitest = {
      typecheck: true,
    };
  }
  config.settings = {
    ...ourSettings,
    ...overrides?.settings,
  };

  const baseRuleGroups = buildBaseRuleGroups(options);
  config.plugins = buildPlugins(baseRuleGroups, overrides);
  config.rules = buildRules(baseRuleGroups, overrides);
  config.overrides = buildOverrides(options, baseRuleGroups, overrides);

  if (Array.isArray(overrides?.extends)) {
    config.extends = overrides.extends;
  }
  if (Array.isArray(overrides?.ignorePatterns)) {
    config.ignorePatterns = overrides.ignorePatterns;
  }
  if (Array.isArray(overrides?.jsPlugins)) {
    config.jsPlugins = overrides.jsPlugins;
  }

  return config;
}
