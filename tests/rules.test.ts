import * as fsPromises from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { eslint, importRules, jsdoc, oxc, promise, typescript, unicorn, vitest } from "../src/oxlint/rules/index.ts";
import type { OxlintRuleGroup } from "../src/oxlint/types.ts";

vi.setConfig({ testTimeout: 100 });

const RULES_DIRECTORY = new URL("../src/oxlint/rules/", import.meta.url);

const OXLINT_DIRECTORY = path.dirname(createRequire(import.meta.url).resolve("oxlint/package.json"));

const RULE_GROUP_MODULES = [
  { moduleName: "eslint", group: eslint },
  { moduleName: "import", group: importRules },
  { moduleName: "jsdoc", group: jsdoc },
  { moduleName: "oxc", group: oxc },
  { moduleName: "promise", group: promise },
  { moduleName: "typescript", group: typescript },
  { moduleName: "unicorn", group: unicorn },
  { moduleName: "vitest", group: vitest },
] as const satisfies { moduleName: string; group: OxlintRuleGroup }[];

const RULE_CATEGORIES = [
  "correctness",
  "suspicious",
  "restriction",
  "perf",
  "pedantic",
  "style",
  "nursery",
] as const satisfies readonly (keyof OxlintRuleGroup)[];

// Oxlint carries clippy's "allow" and "deny" aliases, but they read poorly against rule names -- denying `radix`
// sounds like banning the argument rather than requiring it -- so we stick to ESLint's vocabulary
const SEVERITIES = ["error", "off", "warn"];

// Nursery rules only warn, since their options are still unstable; every other rule is on, or deliberately off
const STABLE_SEVERITIES = ["error", "off"];

const RULE_NO_CONFIG_REF = "#/definitions/RuleNoConfig";

const MINIMUM_CONFIGURED_LENGTH = 2;

const SEVERITY_ONLY = "a severity string";
const SEVERITY_WITH_CONFIGURATION = "a severity followed by at least one configuration element";

type RuleCategory = (typeof RULE_CATEGORIES)[number];

interface CatalogEntry {
  category: string;
  scope: string;
  value: string;
}

interface RuleOverrideMetadata {
  files: { description: string };
  settings: unknown;
}

interface RuleMetadata {
  override?: RuleOverrideMetadata;
  settings: unknown;
}

interface RuleEntry {
  category: RuleCategory;
  overrides: RuleOverrideMetadata[];
  plugin: string;
  rule: string;
  settings: unknown;
  subject: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function readSchemaObject(source: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = source[key];
  if (!isRecord(value)) {
    throw new TypeError(`Expected "${key}" to be an object in the oxlint configuration schema`);
  }
  return value;
}

function isCatalogEntry(entry: unknown): entry is CatalogEntry {
  return (
    isRecord(entry) &&
    typeof entry.category === "string" &&
    typeof entry.scope === "string" &&
    typeof entry.value === "string"
  );
}

// `oxlint --rules` reports scopes like `jsx_a11y`, while config keys spell them `jsx-a11y/`; eslint rules are unprefixed
function toRuleKey(entry: CatalogEntry): string {
  return entry.scope === "eslint" ? entry.value : `${entry.scope.replaceAll("_", "-")}/${entry.value}`;
}

/**
 * Reads the per-rule schemas that oxlint ships, which say whether a rule accepts configuration at all.
 *
 * @returns {Promise<Record<string, unknown>>} Oxlint rule schema data
 */
async function readRuleSchemas(): Promise<Record<string, unknown>> {
  const schemaPath = path.join(OXLINT_DIRECTORY, "configuration_schema.json");
  const schema: unknown = JSON.parse(await fsPromises.readFile(schemaPath, "utf8"));
  if (!isRecord(schema)) {
    throw new TypeError("Expected the oxlint configuration schema to be an object");
  }
  return readSchemaObject(readSchemaObject(readSchemaObject(schema, "definitions"), "DummyRuleMap"), "properties");
}

/**
 * Asks oxlint itself which category each rule belongs to, so upgrades that recategorize a rule get caught.
 *
 * @returns {Map<string, string>} A de-duplicated list of rules and their categories
 */
function readRuleCategories(): Map<string, string> {
  const oxlintBin = path.join(OXLINT_DIRECTORY, "bin", "oxlint");
  const reported = execFileSync(process.execPath, [oxlintBin, "--rules", "--format", "json"], { encoding: "utf8" });
  const catalog: unknown = JSON.parse(reported);
  if (!isUnknownArray(catalog)) {
    throw new TypeError("Expected `oxlint --rules` to report an array of rules");
  }
  const categories = new Map<string, string>();
  for (const entry of catalog) {
    if (!isCatalogEntry(entry)) {
      throw new TypeError("Expected every rule reported by `oxlint --rules` to have a scope, value, and category");
    }
    categories.set(toRuleKey(entry), entry.category);
  }
  return categories;
}

function collectRuleEntries(): RuleEntry[] {
  const entries: RuleEntry[] = [];
  for (const { group } of RULE_GROUP_MODULES) {
    for (const category of RULE_CATEGORIES) {
      const metadata: Record<string, RuleMetadata | undefined> = group[category] ?? {};
      for (const [rule, ruleMetadata] of Object.entries(metadata)) {
        if (typeof ruleMetadata !== "undefined") {
          entries.push({
            category,
            overrides: typeof ruleMetadata.override === "undefined" ? [] : [ruleMetadata.override],
            plugin: group.plugin,
            rule,
            settings: ruleMetadata.settings,
            subject: `${group.plugin} ${category} ${rule}`,
          });
        }
      }
    }
  }
  return entries;
}

function takesConfiguration(ruleSchema: unknown): boolean {
  return !(isRecord(ruleSchema) && ruleSchema.$ref === RULE_NO_CONFIG_REF);
}

function getSeverity(settings: unknown): unknown {
  return isUnknownArray(settings) ? settings.at(0) : settings;
}

function describeSettings(settings: unknown): string {
  if (typeof settings === "string") {
    return SEVERITY_ONLY;
  }
  if (isUnknownArray(settings)) {
    return settings.length >= MINIMUM_CONFIGURED_LENGTH ? SEVERITY_WITH_CONFIGURATION : "a severity-only array";
  }
  return `a ${typeof settings} value`;
}

// A rule that's turned off has nothing left to configure, so it stays a plain severity either way
function describeExpectedSettings(ruleSchema: unknown, settings: unknown): string {
  return takesConfiguration(ruleSchema) && getSeverity(settings) !== "off"
    ? SEVERITY_WITH_CONFIGURATION
    : SEVERITY_ONLY;
}

function getPlugin(rule: string): string {
  const separator = rule.indexOf("/");
  return separator === -1 ? "eslint" : rule.slice(0, separator);
}

function describeCategoryPlacement(category: RuleCategory, oxlintCategory = "an unknown category"): string {
  if (oxlintCategory === category) {
    return `categorized as ${category}`;
  }
  if (category === "nursery") {
    return `graduated out of nursery into ${oxlintCategory}, so move it there and raise its severity from "warn" to "error"`;
  }
  if (oxlintCategory === "nursery") {
    return `moved into nursery, so move it there and lower its severity to "warn"`;
  }
  return `categorized as ${oxlintCategory}`;
}

function findDuplicateRules(entries: RuleEntry[]): string[] {
  const locations = new Map<string, string[]>();
  for (const { category, plugin, rule } of entries) {
    const found = locations.get(rule) ?? [];
    found.push(`${plugin}.${category}`);
    locations.set(rule, found);
  }
  return [...locations]
    .filter(([, found]) => found.length > 1)
    .map(([rule, found]) => `${rule} is specified in ${found.join(" and ")}`);
}

const RULE_SCHEMAS = await readRuleSchemas();

const KNOWN_RULES = Object.keys(RULE_SCHEMAS);

const RULE_CATEGORY_BY_RULE = readRuleCategories();

const RULE_MODULE_FILES = await fsPromises.readdir(RULES_DIRECTORY);

const RULE_MODULE_NAMES = RULE_MODULE_FILES.filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .map((file) => path.basename(file, ".ts"))
  .toSorted();

const RULE_ENTRIES = collectRuleEntries();

const SETTINGS_ENTRIES = [
  ...RULE_ENTRIES,
  ...RULE_ENTRIES.flatMap((entry) =>
    entry.overrides.map((ruleOverride) => {
      return {
        ...entry,
        settings: ruleOverride.settings,
        subject: `${entry.subject} overridden for ${ruleOverride.files.description}`,
      };
    }),
  ),
];

const NURSERY_ENTRIES = RULE_ENTRIES.filter(({ category }) => category === "nursery");

const STABLE_ENTRIES = RULE_ENTRIES.filter(({ category }) => category !== "nursery");

describe("rule settings", () => {
  it.for(RULE_ENTRIES)("$subject is a rule oxlint knows about", ({ rule }) => {
    expect(KNOWN_RULES).toContain(rule);
  });

  it.for(SETTINGS_ENTRIES)('$subject uses "error", "warn", or "off" as its severity', ({ settings }) => {
    expect(SEVERITIES).toContain(getSeverity(settings));
  });

  it.for(SETTINGS_ENTRIES)("$subject is shaped the way its schema expects", ({ rule, settings }) => {
    expect(describeSettings(settings)).toBe(describeExpectedSettings(RULE_SCHEMAS[rule], settings));
  });
});

describe("rule plugins", () => {
  it.for(RULE_ENTRIES)("$subject belongs to the $plugin rule group", ({ plugin, rule }) => {
    expect(getPlugin(rule)).toBe(plugin);
  });
});

describe("rule severities", () => {
  it.for(NURSERY_ENTRIES)("$subject only warns while its options are still unstable", ({ settings }) => {
    expect(getSeverity(settings)).toBe("warn");
  });

  it.for(STABLE_ENTRIES)('$subject is set to "error", or deliberately "off"', ({ settings }) => {
    expect(STABLE_SEVERITIES).toContain(getSeverity(settings));
  });
});

describe("rule categories", () => {
  it.for(RULE_ENTRIES)("$subject is categorized the way oxlint categorizes it", ({ category, rule }) => {
    expect(describeCategoryPlacement(category, RULE_CATEGORY_BY_RULE.get(rule))).toBe(`categorized as ${category}`);
  });
});

describe("rule coverage", () => {
  it("specifies each rule exactly once", () => {
    expect(findDuplicateRules(RULE_ENTRIES)).toStrictEqual([]);
  });

  it("registers every module in src/oxlint/rules in RULE_GROUP_MODULES", () => {
    expect(RULE_MODULE_NAMES).toStrictEqual(RULE_GROUP_MODULES.map(({ moduleName }) => moduleName).toSorted());
  });
});
