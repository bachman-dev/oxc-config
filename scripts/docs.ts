#!/usr/bin/env node
import * as fs from "node:fs/promises";
import path from "node:path";

import * as rules from "../src/oxlint/rules/index.ts";
import settings from "../src/oxfmt/settings.ts";
import bachmanDevConfig from "../src/oxlint/index.ts";
import type { OxlintRuleMetadata } from "../src/oxlint/types.ts";
import type { Admonishment } from "../src/types.ts";

const heading = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
} as const;

type Heading = (typeof heading)[keyof typeof heading];

function header(level: Heading, text: string): string {
  return `${"#".repeat(level)} ${text}\n\n`;
}

function paragraph(text: string): string {
  return `${text}\n\n`;
}

function link(text: string, href: string): string {
  return `[${text}](${href})`;
}

function unorderedList(items: string[]): string {
  let listString = "";
  for (const item of items) {
    listString += `- ${item}\n`;
  }
  listString += "\n";
  return listString;
}

function json(item: unknown): string {
  return `\`\`\`json\n${JSON.stringify(item)}\n\`\`\`\n\n`;
}

function admonish(admonishments: Admonishment[]): string {
  let admonishmentString = "";
  for (const admonishment of admonishments) {
    admonishmentString += "> [!";
    switch (admonishment.type) {
      case "caution":
        admonishmentString += "CAUTION";
        break;
      case "important":
        admonishmentString += "IMPORTANT";
        break;
      case "note":
        admonishmentString += "NOTE";
        break;
      case "tip":
        admonishmentString += "TIP";
        break;
      case "warning":
        admonishmentString += "WARNING";
    }
    admonishmentString += `]\n> ${admonishment.text.replaceAll("\n", "\n> ")}\n\n`;
  }
  return admonishmentString;
}

function getOxfmtSettingUrl(setting: string): string {
  return `https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#${setting}`;
}

function getOxlintRuleUrl(rule: string): string {
  const BASE_URL = "https://oxc.rs/docs/guide/usage/linter/rules";
  const [eslintRuleOrPlugin, splitRuleName] = rule.split("/");
  if (typeof eslintRuleOrPlugin === "string" && typeof splitRuleName === "string") {
    // It's a full rule name like "typescript/ban-types"
    return `${BASE_URL}/${eslintRuleOrPlugin}/${splitRuleName}`;
  } else if (typeof eslintRuleOrPlugin === "string") {
    // It's an ESLint rule which is just the rule name like "no-console"
    return `${BASE_URL}/eslint/${eslintRuleOrPlugin}`;
  }
  throw new TypeError("Unexpected type for Plugin or Rule name (getRuleUrl)");
}

function printRuleMetadata(
  metadata: OxlintRuleMetadata,
  empty = "No rules were set for this group's category.",
): string {
  let ruleText = "";
  const category = Object.entries(metadata);
  if (category.length === 0) {
    return paragraph(empty);
  }
  for (const [ruleName, rule] of category) {
    const ruleUrl = getOxlintRuleUrl(ruleName);
    if (typeof rule.override === "object") {
      if (rule.settings === "off" || rule.settings === "allow") {
        if (rule.override.settings === "error" || rule.override.settings === "deny") {
          ruleText += header(heading.four, link(`🔲📂🛑 ${ruleName}`, ruleUrl));
          ruleText += paragraph(
            `This rule throws a linting error only for ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded` : ""}.`,
          );
        } else if (rule.override.settings === "warn") {
          ruleText += header(heading.four, link(`🔲📂⚠️ ${ruleName}`, ruleUrl));
          ruleText += paragraph(
            `This rule emits a warning only for ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded` : ""}.`,
          );
        } else if (Array.isArray(rule.override.settings)) {
          const severity = rule.override.settings.at(0);
          if (severity === "error" || severity === "deny") {
            ruleText += header(heading.four, link(`🔲📂🛑 ${ruleName}`, ruleUrl));
          } else if (severity === "warn") {
            ruleText += header(heading.four, link(`🔲📂⚠️ ${ruleName}`, ruleUrl));
          } else {
            throw new TypeError(
              `Unexpected rule override severity for ${ruleName} when main setting is off and override is array (printRuleMetadata)`,
            );
          }
          if (rule.override.settings.length > 1) {
            ruleText += header(heading.five, "Settings");
            ruleText += paragraph(
              `These settings only apply to ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded` : ""}.`,
            );
            for (const [index, setting] of rule.override.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
          }
        } else {
          throw new TypeError(
            `Unexpected rule override settings type for ${ruleName} when main setting is off (printRuleMetadata)`,
          );
        }
      } else if (rule.settings === "error" || rule.settings === "deny") {
        if (rule.override.settings === "off" || rule.override.settings === "allow") {
          ruleText += header(heading.four, link(`🛑📂🔲 ${ruleName}`, ruleUrl));
          ruleText += paragraph(
            `This rule throws a linting error except for ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore also subject to this rule` : ""}.`,
          );
        } else if (Array.isArray(rule.override.settings)) {
          const severity = rule.override.settings.at(0);
          if (severity === "off" || severity === "allow") {
            ruleText += header(heading.four, link(`🛑📂🔲 ${ruleName}`, ruleUrl));
          } else {
            throw new TypeError(
              `Unexpected rule override severity for ${ruleName} when main setting is error and override is array (printRuleMetadata)`,
            );
          }
          if (rule.override.settings.length > 1) {
            ruleText += header(heading.five, "Settings");
            ruleText += paragraph(
              `These settings apply to all lintable files except ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore also subject to this rule` : ""}.`,
            );
            for (const [index, setting] of rule.override.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
          }
        } else {
          throw new TypeError(
            `Unexpected rule override settings type for ${ruleName} when main setting is error (printRuleMetadata)`,
          );
        }
      } else if (rule.settings === "warn") {
        if (rule.override.settings === "off" || rule.override.settings === "allow") {
          ruleText += header(heading.four, link(`⚠️📂🔲 ${ruleName}`, ruleUrl));
          ruleText += paragraph(
            `This rule emits a warning except for ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore also subject to this rule` : ""}.`,
          );
        } else if (Array.isArray(rule.override.settings)) {
          const severity = rule.override.settings.at(0);
          if (severity === "off" || severity === "allow") {
            ruleText += header(heading.four, link(`⚠️📂🔲 ${ruleName}`, ruleUrl));
          } else {
            throw new TypeError(
              `Unexpected rule override severity for ${ruleName} when main setting is warn and override is array (printRuleMetadata)`,
            );
          }
          if (rule.override.settings.length > 1) {
            ruleText += header(heading.five, "Settings");
            ruleText += paragraph(
              `These settings apply to all lintable files except ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore also subject to this rule` : ""}.`,
            );
            for (const [index, setting] of rule.override.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
          }
        } else {
          throw new TypeError(
            `Unexpected rule override settings type for ${ruleName} when main setting is warn (printRuleMetadata)`,
          );
        }
      } else if (Array.isArray(rule.settings) && Array.isArray(rule.override.settings)) {
        const rootSeverity = rule.settings.at(0);
        const overrideSeverity = rule.override.settings.at(0);
        if (
          (rootSeverity === "off" || rootSeverity === "allow") &&
          (overrideSeverity === "error" || overrideSeverity === "deny")
        ) {
          ruleText += header(heading.four, link(`🔲📂🛑 ${ruleName}`, ruleUrl));
        } else if ((rootSeverity === "off" || rootSeverity === "allow") && overrideSeverity === "warn") {
          ruleText += header(heading.four, link(`🔲📂⚠️ ${ruleName}`, ruleUrl));
        } else if (
          (rootSeverity === "error" || rootSeverity === "deny") &&
          (overrideSeverity === "error" || overrideSeverity === "deny")
        ) {
          ruleText += header(heading.four, link(`🛑📂🛑 ${ruleName}`, ruleUrl));
        } else if (
          (rootSeverity === "error" || rootSeverity === "deny") &&
          (overrideSeverity === "off" || overrideSeverity === "allow")
        ) {
          ruleText += header(heading.four, link(`🛑📂🔲 ${ruleName}`, ruleUrl));
        } else if (rootSeverity === "warn" && overrideSeverity === "warn") {
          ruleText += header(heading.four, link(`⚠️📂⚠️ ${ruleName}`, ruleUrl));
        } else if (rootSeverity === "warn" && (overrideSeverity === "off" || overrideSeverity === "allow")) {
          ruleText += header(heading.four, link(`⚠️📂🔲 ${ruleName}`, ruleUrl));
        } else {
          throw new TypeError(
            `Unexpected rule/override severity combination for ${ruleName} when main setting is array (printRuleMetadata)`,
          );
        }
        if (rule.settings.length > 1 && rule.override.settings.length > 1) {
          ruleText += header(heading.five, "Settings");
          if (rootSeverity === overrideSeverity) {
            ruleText += paragraph("These are the default settings applied to most lintable files.");
            for (const [index, setting] of rule.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
            ruleText += paragraph(
              `These settings apply only to ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore use the default settings` : ""}.`,
            );
            for (const [index, setting] of rule.override.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
          } else if (rootSeverity === "off" || rootSeverity === "allow") {
            ruleText += paragraph(
              `These settings only apply to ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded` : ""}.`,
            );
            for (const [index, setting] of rule.override.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
          } else if (overrideSeverity === "off" || overrideSeverity === "allow") {
            ruleText += paragraph(
              `These settings apply to all lintable files except ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore also subject to this rule` : ""}.`,
            );
            for (const [index, setting] of rule.settings.entries()) {
              if (index > 0) {
                ruleText += json(setting);
              }
            }
          }
        }
      } else if (
        Array.isArray(rule.settings) &&
        (rule.override.settings === "off" || rule.override.settings === "allow")
      ) {
        const severity = rule.settings.at(0);
        if (severity === "error" || severity === "deny") {
          ruleText += header(heading.four, link(`🛑📂🔲 ${ruleName}`, ruleUrl));
        } else if (severity === "warn") {
          ruleText += header(heading.four, link(`⚠️📂🔲 ${ruleName}`, ruleUrl));
        } else {
          throw new TypeError(`Unexpected rule severity for ${ruleName} when override is off (printRuleMetadata)`);
        }
        if (rule.settings.length > 1) {
          ruleText += header(heading.five, "Settings");
          ruleText += paragraph(
            `These settings apply to all lintable files except ${rule.override.files.description}${typeof rule.override.excludeFiles?.description === "string" ? `, of which ${rule.override.excludeFiles.description} are excluded and therefore also subject to this rule` : ""}.`,
          );
          for (const [index, setting] of rule.settings.entries()) {
            if (index > 0) {
              ruleText += json(setting);
            }
          }
        }
      } else {
        throw new TypeError(`Unexpected rule settings type for ${ruleName} with override (printRuleMetadata)`);
      }
    } else if (rule.settings === "off" || rule.settings === "allow") {
      ruleText += header(heading.four, link(`🔲 ${ruleName}`, ruleUrl));
    } else if (rule.settings === "error" || rule.settings === "deny") {
      ruleText += header(heading.four, link(`🛑 ${ruleName}`, ruleUrl));
    } else if (rule.settings === "warn") {
      ruleText += header(heading.four, link(`⚠️ ${ruleName}`, ruleUrl));
    } else if (Array.isArray(rule.settings)) {
      const severity = rule.settings.at(0);
      if (severity === "off" || severity === "allow") {
        ruleText += header(heading.four, link(`🔲 ${ruleName}`, ruleUrl));
      } else if (severity === "error" || severity === "deny") {
        ruleText += header(heading.four, link(`🛑 ${ruleName}`, ruleUrl));
      } else if (severity === "warn") {
        ruleText += header(heading.four, link(`⚠️ ${ruleName}`, ruleUrl));
      } else {
        throw new TypeError(`Unexpected rule severity for ${ruleName} (printRuleMetadata)`);
      }
      if (rule.settings.length > 1) {
        ruleText += header(heading.five, "Settings");
        for (const [index, setting] of rule.settings.entries()) {
          if (index > 0) {
            ruleText += json(setting);
          }
        }
      }
    } else {
      throw new TypeError(`Unexpected rule settings type for ${ruleName} (printRuleMetadata)`);
    }
    if (Array.isArray(rule.admonishments)) {
      ruleText += admonish(rule.admonishments);
    }
  }

  return ruleText;
}

const srcPath = path.join(process.cwd(), "src");
const oxfmtReadmePath = path.join(srcPath, "oxfmt", "README.md");
const oxlintReadmePath = path.join(srcPath, "oxlint", "README.md");

const autoGenCaution: Admonishment = {
  type: "caution",
  text: `This file is auto-generated by ${link("docs.ts", "/scripts/docs.ts")} and should not be edited directly.`,
};

let readmeMarkdown = admonish([autoGenCaution]);
readmeMarkdown += header(heading.one, "Oxfmt Configuration");
readmeMarkdown += paragraph(
  "Here is a rundown of each Oxfmt setting that we enforce to provide a consistent style across code, configuration files, documentation, and other text files in our codebases.",
);

for (const [key, value] of Object.entries(settings)) {
  readmeMarkdown += header(heading.two, link(key, getOxfmtSettingUrl(key)));
  readmeMarkdown += header(heading.three, "Setting");
  readmeMarkdown += json(value.setting);
  if (typeof value.explanation === "string") {
    readmeMarkdown += header(heading.three, "Explanation");
    readmeMarkdown += paragraph(value.explanation);
  } else {
    readmeMarkdown += header(heading.three, "Explanations");
    readmeMarkdown += unorderedList(value.explanation);
  }
  if (Array.isArray(value.admonishments)) {
    readmeMarkdown += admonish(value.admonishments);
  }
}

await fs.writeFile(oxfmtReadmePath, readmeMarkdown, "utf8");

readmeMarkdown = admonish([autoGenCaution]);
readmeMarkdown += header(heading.one, "Oxlint Rules and Settings");
readmeMarkdown += paragraph(
  "This is an extensive list of all the rules and settings that are available from this Oxlint configuration.",
);

readmeMarkdown += paragraph(
  "Here is a generated config when `bachmanDevConfig` is exported without disabling any plugins nor passing in any oxlint configuration as an override. We've excluded `rules` and `overrides` to save space.",
);
const dummyConfig = bachmanDevConfig();
delete dummyConfig.rules;
delete dummyConfig.overrides;
readmeMarkdown += json(dummyConfig);

readmeMarkdown += paragraph("We've organized the rules in each group into the following oxlint categories:");
readmeMarkdown += unorderedList([
  "**Correctness:** Code that is definitely wrong or useless (only when we deviate from default settings or limit/disable the rule per certain files)",
  "**Suspicious:** Code that is likely to be wrong or useless",
  "**Restriction:** Rules that ban specific patterns or features",
  "**Perf:** Rules that aim to improve runtime performance",
  "**Pedantic:** Extra strict rules that may have false positives",
  "**Style:** Idiomatic and consistent style rules",
  '**Nursery (optional):** Rules under development that may change (these will only emit a warning until they "graduate" into one of the other categories)',
]);

readmeMarkdown += header(heading.two, "Legend");
readmeMarkdown += unorderedList([
  "🛑 Throws a Linting Error for ALL Lintable Files",
  "🛑📂🛑 Throws a Linting Error, Has Different Settings for Specific Files",
  "🔲📂🛑 Throws a Linting Error ONLY for Specific Files",
  "🛑📂🔲 Throws a Linting Error EXCEPT for Specific Files",
  "⚠️ Emits a Warning for ALL Lintable Files",
  "⚠️📂⚠️ Emits a Warning, Has Different Settings for Specific Files",
  "🔲📂⚠️ Emits a Warning ONLY for Specific Files",
  "⚠️📂🔲 Emits a Warning EXCEPT for Specific Files",
  "🔲 Intentionally and Completely Disabled",
]);

for (const group of Object.values(rules)) {
  readmeMarkdown += header(heading.two, group.name);
  readmeMarkdown += paragraph(group.description);

  if (Array.isArray(group.admonishments)) {
    readmeMarkdown += admonish(group.admonishments);
  }

  readmeMarkdown += header(heading.three, "Correctness");
  readmeMarkdown += printRuleMetadata(
    group.correctness,
    "No rules have had their settings changed apart from the defaults provided by oxlint.",
  );
  readmeMarkdown += header(heading.three, "Suspicious");
  readmeMarkdown += printRuleMetadata(group.suspicious);
  readmeMarkdown += header(heading.three, "Restriction");
  readmeMarkdown += printRuleMetadata(group.restriction);
  readmeMarkdown += header(heading.three, "Perf");
  readmeMarkdown += printRuleMetadata(group.perf);
  readmeMarkdown += header(heading.three, "Pedantic");
  readmeMarkdown += printRuleMetadata(group.pedantic);
  readmeMarkdown += header(heading.three, "Style");
  readmeMarkdown += printRuleMetadata(group.style);
  if (typeof group.nursery === "object") {
    readmeMarkdown += header(heading.three, "Nursery");
    readmeMarkdown += printRuleMetadata(group.nursery);
  }
}

await fs.writeFile(oxlintReadmePath, readmeMarkdown, "utf8");
