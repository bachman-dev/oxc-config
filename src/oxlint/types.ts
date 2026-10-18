import type { DummyRuleMap, OxlintConfig } from "oxlint";

import type { Admonishment, RemoveIndex, UiFramework } from "../types.ts";

export interface OxlintConfigOptions {
  eslint?: boolean;
  import?: boolean;
  jsdoc?: boolean;
  oxc?: boolean;
  promise?: boolean;
  typescript?: boolean;
  unicorm?: boolean;
  vitest?: boolean | string[];
  uiFrameworks?: UiFramework[];
}

export interface OverrideGlobSet {
  description: string;
  globs: (config: OxlintConfigOptions) => string[];
}

export type OxlintRuleMetadata = {
  [Rule in keyof RemoveIndex<DummyRuleMap>]: {
    settings: DummyRuleMap[Rule];
    admonishments?: [first: Admonishment, ...rest: Admonishment[]];
    override?: {
      files: OverrideGlobSet;
      excludeFiles?: OverrideGlobSet;
      settings: DummyRuleMap[Rule];
    };
  };
};

export type LintPlugin = NonNullable<OxlintConfig["plugins"]>[number];

export interface OxlintRuleGroup {
  name: string;
  plugin: LintPlugin;
  description: string;
  changes?: string[];
  correctness: OxlintRuleMetadata;
  suspicious: OxlintRuleMetadata;
  restriction: OxlintRuleMetadata;
  perf: OxlintRuleMetadata;
  pedantic: OxlintRuleMetadata;
  style: OxlintRuleMetadata;
  nursery?: OxlintRuleMetadata;
  admonishments?: [first: Admonishment, ...rest: Admonishment[]];
}

export type JsDocSettings = NonNullable<NonNullable<OxlintConfig["settings"]>["jsdoc"]>;
export type VitestSettings = NonNullable<NonNullable<OxlintConfig["settings"]>["vitest"]>;

export interface OxlintUiFrameworkMetadata {
  name: string;
  description: string;
  files: OverrideGlobSet;
  env: Record<string, { setting: boolean; explanation: string }>;
  rules: {
    [Rule in keyof RemoveIndex<DummyRuleMap>]?: {
      settings: DummyRuleMap[Rule];
      explanation: string;
    };
  };
  admonishments?: [first: Admonishment, ...rest: Admonishment[]];
}
