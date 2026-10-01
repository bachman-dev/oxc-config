#!/usr/bin/env node
import * as fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import bachmanDevConfig from "../src/oxlint/index.ts";

// Reports what changed in oxlint and oxfmt between the floor of our peerDependencies ranges and the versions in our
// devDependencies, as raw material for the peer-bump tracking issue (see .claude/skills/oxc-peer-tracker/SKILL.md).
//
// Usage: node ./scripts/oxc-version-diff.ts [rule ...]
//
// Extra arguments are rule keys (eg `no-unused-vars`, `typescript/unified-signatures`) whose status in our config
// should be reported alongside the rules found in the catalog diff and changelogs. Run `pnpm build` first so the
// formatting check against the peer-floor oxfmt can load our own config.

interface CatalogEntry {
  category: string;
  default: boolean;
  fix: string;
  scope: string;
  type_aware: boolean;
  value: string;
}

interface Versions {
  peerFloor: string;
  peerRange: string;
  dev: string;
}

type JsonRecord = Record<string, unknown>;

const TOOLS = ["oxlint", "oxfmt"] as const;

type Tool = (typeof TOOLS)[number];

const CATALOG_FIELDS = ["category", "fix", "type_aware", "default"] as const satisfies (keyof CatalogEntry)[];

const CHANGELOG_BASE_URL = "https://raw.githubusercontent.com/oxc-project/oxc/main/";

// Changelogs whose version headings follow each tool's own version numbers
const CHANGELOGS: Record<Tool, string[]> = {
  oxlint: ["apps/oxlint/CHANGELOG.md", "crates/oxc_linter/CHANGELOG.md"],
  oxfmt: [
    "apps/oxfmt/CHANGELOG.md",
    "crates/oxc_formatter/CHANGELOG.md",
    "crates/oxc_formatter_core/CHANGELOG.md",
    "crates/oxc_formatter_css/CHANGELOG.md",
    "crates/oxc_formatter_graphql/CHANGELOG.md",
    "crates/oxc_formatter_json/CHANGELOG.md",
    "crates/oxc_formatter_markdown/CHANGELOG.md",
    "crates/oxc_formatter_yaml/CHANGELOG.md",
  ],
};

const CHANGELOG_HEADING = /^## \[(?<version>\d+\.\d+\.\d+)\]/v;

// Matches scoped changelog entries such as "linter/eslint/no-unused-vars:" or "linter/unicorn/prefer-spread:"
const CHANGELOG_RULE = /linter\/(?<plugin>[\w\-]+)\/(?<rule>[\w\-]+):/gv;

const SEMVER = /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/v;

const PROJECT_DIRECTORY = process.cwd();

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCatalogEntry(entry: unknown): entry is CatalogEntry {
  return (
    isRecord(entry) &&
    typeof entry.category === "string" &&
    typeof entry.fix === "string" &&
    typeof entry.scope === "string" &&
    typeof entry.value === "string"
  );
}

function readRecord(value: unknown, key: string): JsonRecord {
  if (!isRecord(value)) {
    return {};
  }
  const child = value[key];
  return isRecord(child) ? child : {};
}

function parseVersion(version: string): [major: number, minor: number, patch: number] {
  const groups = SEMVER.exec(version)?.groups;
  if (typeof groups === "undefined") {
    throw new TypeError(`Expected "${version}" to contain a semantic version`);
  }
  return [Number(groups.major), Number(groups.minor), Number(groups.patch)];
}

function compareVersions(first: string, second: string): number {
  const firstParts = parseVersion(first);
  const secondParts = parseVersion(second);
  for (const [index, part] of firstParts.entries()) {
    const difference = part - (secondParts[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

function isInRange(version: string, versions: Versions): boolean {
  return compareVersions(version, versions.peerFloor) > 0 && compareVersions(version, versions.dev) <= 0;
}

function readToolVersions(tool: Tool, peerDependencies: JsonRecord, devDependencies: JsonRecord): Versions {
  const peerRange = peerDependencies[tool];
  const dev = devDependencies[tool];
  if (typeof peerRange !== "string" || typeof dev !== "string") {
    throw new TypeError(`Expected ${tool} in both peerDependencies and devDependencies`);
  }
  const [major, minor, patch] = parseVersion(peerRange);
  return { peerFloor: `${major}.${minor}.${patch}`, peerRange, dev };
}

async function readVersions(): Promise<Record<Tool, Versions>> {
  const packageJson: unknown = JSON.parse(await fs.readFile(path.join(PROJECT_DIRECTORY, "package.json"), "utf8"));
  const peerDependencies = readRecord(packageJson, "peerDependencies");
  const devDependencies = readRecord(packageJson, "devDependencies");
  return {
    oxlint: readToolVersions("oxlint", peerDependencies, devDependencies),
    oxfmt: readToolVersions("oxfmt", peerDependencies, devDependencies),
  };
}

function installPeerFloor(directory: string, versions: Record<Tool, Versions>): void {
  execFileSync(
    "npm",
    [
      "install",
      "--no-save",
      "--no-package-lock",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--silent",
      ...TOOLS.map((tool) => `${tool}@${versions[tool].peerFloor}`),
    ],
    { cwd: directory, stdio: "inherit", shell: process.platform === "win32" },
  );
}

function toRuleKey(scope: string, rule: string): string {
  const plugin = scope.replaceAll("_", "-");
  return plugin === "eslint" ? rule : `${plugin}/${rule}`;
}

function readCatalog(packageDirectory: string, workDirectory: string): Map<string, CatalogEntry> {
  const oxlintBin = path.join(packageDirectory, "bin", "oxlint");
  // An empty config keeps oxlint from discovering (and loading) any config file around the work directory
  const reported = execFileSync(
    process.execPath,
    [oxlintBin, "--config", path.join(workDirectory, "empty.json"), "--rules", "--format", "json"],
    { cwd: workDirectory, encoding: "utf8" },
  );
  const catalog: unknown = JSON.parse(reported);
  if (!Array.isArray(catalog)) {
    throw new TypeError("Expected `oxlint --rules` to report an array of rules");
  }
  const entries = new Map<string, CatalogEntry>();
  for (const entry of catalog) {
    if (!isCatalogEntry(entry)) {
      throw new TypeError("Expected every rule reported by `oxlint --rules` to have a scope, value, category and fix");
    }
    entries.set(toRuleKey(entry.scope, entry.value), entry);
  }
  return entries;
}

function toPluginName(ruleKey: string): string {
  return ruleKey.includes("/") ? (ruleKey.split("/").at(0) ?? "eslint") : "eslint";
}

async function readSchema(packageDirectory: string): Promise<JsonRecord> {
  const schema: unknown = JSON.parse(
    await fs.readFile(path.join(packageDirectory, "configuration_schema.json"), "utf8"),
  );
  return isRecord(schema) ? schema : {};
}

// The schema repeats each description as `markdownDescription`, which only doubles the size of the report
function describeValue(value: unknown): string {
  return JSON.stringify(value, (key, child: unknown) => (key === "markdownDescription" ? undefined : child));
}

function describeKeyDiff(label: string, before: JsonRecord, after: JsonRecord): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(after).toSorted()) {
    if (!(key in before)) {
      lines.push(`- ${label} \`${key}\` added: \`${describeValue(after[key])}\``);
    } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      lines.push(
        `- ${label} \`${key}\` changed`,
        `  - before: \`${describeValue(before[key])}\``,
        `  - after: \`${describeValue(after[key])}\``,
      );
    }
  }
  for (const key of Object.keys(before).toSorted()) {
    if (!(key in after)) {
      lines.push(`- ${label} \`${key}\` removed`);
    }
  }
  return lines;
}

function diffSchemas(before: JsonRecord, after: JsonRecord): string[] {
  const lines = describeKeyDiff(
    "top-level property",
    readRecord(before, "properties"),
    readRecord(after, "properties"),
  );
  const beforeDefinitions = readRecord(before, "definitions");
  const afterDefinitions = readRecord(after, "definitions");
  for (const name of Object.keys(afterDefinitions).toSorted()) {
    if (!(name in beforeDefinitions)) {
      lines.push(`- definition \`${name}\` added`);
    } else if (JSON.stringify(beforeDefinitions[name]) !== JSON.stringify(afterDefinitions[name])) {
      const propertyLines = describeKeyDiff(
        `\`${name}\` property`,
        readRecord(beforeDefinitions[name], "properties"),
        readRecord(afterDefinitions[name], "properties"),
      );
      lines.push(...(propertyLines.length > 0 ? propertyLines : [`- definition \`${name}\` changed`]));
    }
  }
  for (const name of Object.keys(beforeDefinitions).toSorted()) {
    if (!(name in afterDefinitions)) {
      lines.push(`- definition \`${name}\` removed`);
    }
  }
  return lines;
}

function diffCatalogs(
  before: Map<string, CatalogEntry>,
  after: Map<string, CatalogEntry>,
): { lines: string[]; rules: string[] } {
  const lines: string[] = [];
  const rules: string[] = [];
  for (const [key, entry] of after) {
    const previous = before.get(key);
    if (typeof previous === "undefined") {
      lines.push(
        `- added \`${key}\`: category \`${entry.category}\`, fix \`${entry.fix}\`, type-aware \`${String(entry.type_aware)}\`, on by default \`${String(entry.default)}\``,
      );
      rules.push(key);
    } else {
      const changes = CATALOG_FIELDS.filter((field) => previous[field] !== entry[field]).map(
        (field) => `${field} \`${String(previous[field])}\` → \`${String(entry[field])}\``,
      );
      if (changes.length > 0) {
        lines.push(`- changed \`${key}\`: ${changes.join(", ")}`);
        rules.push(key);
      }
    }
  }
  for (const key of before.keys()) {
    if (!after.has(key)) {
      lines.push(`- removed \`${key}\``);
      rules.push(key);
    }
  }
  return { lines, rules };
}

function describeSeverity(settings: unknown): string {
  return Array.isArray(settings) ? `${String(settings.at(0))} (with options)` : String(settings);
}

function describeRuleStatus(ruleKey: string, catalog: Map<string, CatalogEntry>): string {
  const config = bachmanDevConfig();
  const entry = catalog.get(ruleKey);
  const parts: string[] = [];
  const settings = config.rules?.[ruleKey];
  if (typeof settings !== "undefined") {
    parts.push(`configured: ${describeSeverity(settings)}`);
  }
  for (const override of config.overrides ?? []) {
    const overrideSettings = override.rules?.[ruleKey];
    if (typeof overrideSettings !== "undefined") {
      parts.push(`override for \`${override.files.join(", ")}\`: ${describeSeverity(overrideSettings)}`);
    }
  }
  if (parts.length === 0) {
    const pluginEnabled = (config.plugins ?? []).some((plugin) => plugin === toPluginName(ruleKey));
    if (typeof entry === "undefined") {
      parts.push("not in the installed oxlint catalog (check the rule name)");
    } else if (entry.category === "correctness" && pluginEnabled) {
      parts.push("on via the `correctness` category");
    } else if (pluginEnabled) {
      parts.push(`not enabled (category \`${entry.category}\`)`);
    } else {
      parts.push("not enabled (plugin not used)");
    }
  }
  return `- \`${ruleKey}\`: ${parts.join("; ")}`;
}

async function fetchChangelogSections(file: string, versions: Versions): Promise<string> {
  const response = await fetch(`${CHANGELOG_BASE_URL}${file}`);
  if (!response.ok) {
    return `_Could not fetch \`${file}\` (HTTP ${response.status})._\n`;
  }
  const changelog = await response.text();
  const sections: string[] = [];
  let keep = false;
  for (const line of changelog.split("\n")) {
    const version = CHANGELOG_HEADING.exec(line)?.groups?.version;
    if (typeof version === "string") {
      keep = isInRange(version, versions);
    }
    if (keep) {
      sections.push(line.startsWith("#") ? `#${line}` : line);
    }
  }
  return sections.length > 0 ? `${sections.join("\n").trim()}\n` : "_No entries in range._\n";
}

function findChangelogRules(text: string): string[] {
  const rules = new Set<string>();
  for (const match of text.matchAll(CHANGELOG_RULE)) {
    const { plugin, rule } = match.groups ?? {};
    if (typeof plugin === "string" && typeof rule === "string") {
      rules.add(toRuleKey(plugin, rule));
    }
  }
  return [...rules];
}

async function isBuilt(): Promise<boolean> {
  try {
    await fs.access(path.join(PROJECT_DIRECTORY, "dist", "oxfmt", "index.mjs"));
    return true;
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function checkFormatting(oxfmtDirectory: string): Promise<string> {
  if (!(await isBuilt())) {
    return "_Skipped: run `pnpm build` first so our oxfmt config can load._\n";
  }
  try {
    execFileSync(
      process.execPath,
      [path.join(oxfmtDirectory, "bin", "oxfmt"), "--check", "--config", "oxfmt.config.ts", "."],
      { cwd: PROJECT_DIRECTORY, encoding: "utf8", stdio: "pipe" },
    );
    return "The peer-floor oxfmt reports no formatting differences in this repository.\n";
  } catch (error) {
    const output = isRecord(error) && typeof error.stdout === "string" ? error.stdout : String(error);
    return `The peer-floor oxfmt would format this repository differently:\n\n\`\`\`text\n${output.trim()}\n\`\`\`\n`;
  }
}

const versions = await readVersions();
const workDirectory = await fs.mkdtemp(path.join(tmpdir(), "oxc-version-diff-"));

try {
  await fs.writeFile(path.join(workDirectory, "package.json"), '{ "private": true }\n', "utf8");
  await fs.writeFile(path.join(workDirectory, "empty.json"), "{}\n", "utf8");
  installPeerFloor(workDirectory, versions);

  const floorDirectory = (tool: Tool): string => path.join(workDirectory, "node_modules", tool);
  const devDirectory = (tool: Tool): string => path.join(PROJECT_DIRECTORY, "node_modules", tool);

  const floorCatalog = readCatalog(floorDirectory("oxlint"), workDirectory);
  const devCatalog = readCatalog(devDirectory("oxlint"), workDirectory);
  const catalogDiff = diffCatalogs(floorCatalog, devCatalog);

  const changelogFiles = TOOLS.flatMap((tool) =>
    CHANGELOGS[tool].map((file) => {
      return { file, tool };
    }),
  );
  const changelogs = await Promise.all(
    changelogFiles.map(async ({ file, tool }) => {
      return { file, text: await fetchChangelogSections(file, versions[tool]) };
    }),
  );
  const schemaDiffs = await Promise.all(
    TOOLS.map(async (tool) =>
      diffSchemas(await readSchema(floorDirectory(tool)), await readSchema(devDirectory(tool))),
    ),
  );

  const statusRules = new Set([
    ...catalogDiff.rules,
    ...changelogs.flatMap(({ text }) => findChangelogRules(text)),
    ...parseArgs({ allowPositionals: true }).positionals,
  ]);

  let report = "# oxlint/oxfmt peer-floor → devDependency diff\n\n";
  report += "| Package | peerDependencies | Peer floor | devDependencies |\n| --- | --- | --- | --- |\n";
  for (const tool of TOOLS) {
    report += `| ${tool} | \`${versions[tool].peerRange}\` | ${versions[tool].peerFloor} | ${versions[tool].dev} |\n`;
  }
  report += "\n## oxlint rule catalog changes\n\n";
  report += catalogDiff.lines.length > 0 ? `${catalogDiff.lines.join("\n")}\n` : "No changes.\n";
  for (const [index, tool] of TOOLS.entries()) {
    const lines = schemaDiffs[index] ?? [];
    report += `\n## ${tool} configuration schema changes\n\n`;
    report += lines.length > 0 ? `${lines.join("\n")}\n` : "No changes.\n";
  }
  report += "\n## Status of affected rules in our config\n\n";
  report += `${[...statusRules]
    .toSorted()
    .map((rule) => describeRuleStatus(rule, devCatalog))
    .join("\n")}\n`;
  report += "\n## Formatting check with the peer-floor oxfmt\n\n";
  report += await checkFormatting(floorDirectory("oxfmt"));
  report += "\n## Changelog entries in range\n";
  for (const { file, text } of changelogs) {
    report += `\n### \`${file}\`\n\n${text}`;
  }
  process.stdout.write(report);
} finally {
  await fs.rm(workDirectory, { force: true, recursive: true });
}
