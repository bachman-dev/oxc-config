import * as fsPromises from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

import type { OxlintConfig, OxlintOverride } from "oxlint";
import { describe, expect, it, vi } from "vitest";

import bachmanDev from "../src/oxfmt/index.ts";
import bachmanDevConfig from "../src/oxlint/index.ts";
import oxlintUiFrameworks from "../src/oxlint/ui-frameworks.ts";

// Most tests here only build a config, but a few run oxlint itself against a component
vi.setConfig({ testTimeout: 10_000 });

const OXLINT_DIRECTORY = path.dirname(createRequire(import.meta.url).resolve("oxlint/package.json"));

const ASTRO_GLOBS = ["**/*.astro"];

// A component trips every rule the Astro override adjusts: a PascalCase name, the `Astro` and `document` globals,
// and top-level declarations in a `<script>` tag with no imports or exports
const ASTRO_COMPONENT = `---
const { title } = Astro.props;
---

<h1>{title}</h1>

<script>
  const heading = document.querySelector("h1");
  heading?.classList.add("loaded");
</script>
`;

const ASTRO_RULES = Object.keys(oxlintUiFrameworks.astro.rules);

interface LintDiagnostic {
  code: string;
  filename: string;
}

function isLintReport(value: unknown): value is { diagnostics: LintDiagnostic[] } {
  return typeof value === "object" && value !== null && "diagnostics" in value && Array.isArray(value.diagnostics);
}

async function lintAstroComponent(config: object): Promise<string[]> {
  const directory = await fsPromises.mkdtemp(path.join(tmpdir(), "oxc-config-astro-"));
  try {
    const configPath = path.join(directory, ".oxlintrc.json");
    await fsPromises.writeFile(configPath, JSON.stringify(config), "utf8");
    await fsPromises.writeFile(path.join(directory, "Heading.astro"), ASTRO_COMPONENT, "utf8");
    const oxlintBin = path.join(OXLINT_DIRECTORY, "bin", "oxlint");
    let reported: string;
    try {
      reported = execFileSync(process.execPath, [oxlintBin, "--config", configPath, "--format", "json", directory], {
        encoding: "utf8",
      });
    } catch (error) {
      // Oxlint exits non-zero when it finds errors, but still reports them
      if (typeof error === "object" && error !== null && "stdout" in error && typeof error.stdout === "string") {
        reported = error.stdout;
      } else {
        throw error;
      }
    }
    const report: unknown = JSON.parse(reported);
    if (!isLintReport(report)) {
      throw new TypeError("Expected oxlint to report an object with a diagnostics array");
    }
    return report.diagnostics.map((diagnostic) => diagnostic.code);
  } finally {
    await fsPromises.rm(directory, { force: true, recursive: true });
  }
}

function isAstroOverride(override: OxlintOverride): boolean {
  return override.files.join(",") === ASTRO_GLOBS.join(",");
}

function findAstroOverrides(config: OxlintConfig): OxlintOverride[] {
  return (config.overrides ?? []).filter((override) => isAstroOverride(override));
}

function getAstroOverride(config: OxlintConfig): OxlintOverride {
  const [astroOverride] = findAstroOverrides(config);
  if (typeof astroOverride === "undefined") {
    throw new TypeError("Expected the config to have an Astro override");
  }
  return astroOverride;
}

function getAstroRuleNames(config: OxlintConfig): string[] {
  return Object.keys(getAstroOverride(config).rules ?? {});
}

// Type-aware linting needs a tsconfig and tsgolint; the Astro override doesn't depend on either
const NOT_TYPE_AWARE = { options: { typeAware: false, typeCheck: false } };

describe("oxlint uiFrameworks", () => {
  it("adds no Astro override by default", () => {
    expect(findAstroOverrides(bachmanDevConfig())).toStrictEqual([]);
  });

  it("adds the Astro override when astro is listed", () => {
    const config = bachmanDevConfig({ uiFrameworks: ["astro"] });
    expect(getAstroOverride(config).env).toStrictEqual({ astro: true, browser: true });
    expect(getAstroRuleNames(config)).toStrictEqual(ASTRO_RULES);
  });

  it("adds the Astro override once when astro is listed twice", () => {
    expect(findAstroOverrides(bachmanDevConfig({ uiFrameworks: ["astro", "astro"] }))).toHaveLength(1);
  });

  it("leaves out rules from plugins that are turned off", () => {
    expect(getAstroRuleNames(bachmanDevConfig({ uiFrameworks: ["astro"], unicorm: false }))).not.toContain(
      "unicorn/filename-case",
    );
  });

  it("applies the user's own overrides after the Astro override", () => {
    const userOverride = { files: ASTRO_GLOBS, rules: { "no-alert": "off" as const } };
    const { overrides } = bachmanDevConfig({ uiFrameworks: ["astro"] }, { overrides: [userOverride] });
    expect(overrides?.at(-1)).toStrictEqual(userOverride);
  });

  it("reports the Astro-specific problems in a component without the Astro override", async () => {
    expect.hasAssertions();
    const codes = await lintAstroComponent(bachmanDevConfig(undefined, NOT_TYPE_AWARE));
    expect(codes).toStrictEqual(
      expect.arrayContaining([
        "eslint(no-implicit-globals)",
        "eslint(no-undef)",
        "import(unambiguous)",
        "unicorn(filename-case)",
      ]),
    );
  });

  it("lints a component cleanly with the Astro override", async () => {
    expect.hasAssertions();
    const codes = await lintAstroComponent(bachmanDevConfig({ uiFrameworks: ["astro"] }, NOT_TYPE_AWARE));
    expect(codes).toStrictEqual([]);
  });
});

describe("oxfmt uiFrameworks", () => {
  it("leaves Astro formatting off by default", () => {
    expect(bachmanDev().astro).toBe(false);
  });

  it("turns on Astro formatting when astro is listed", () => {
    expect(bachmanDev(undefined, { uiFrameworks: ["astro"] }).astro).toStrictEqual({
      allowShorthand: true,
      compressHTML: "jsx",
      skipFrontmatter: false,
    });
  });

  it("lets the user's own astro setting win", () => {
    expect(bachmanDev({ astro: { skipFrontmatter: true } }, { uiFrameworks: ["astro"] }).astro).toStrictEqual({
      skipFrontmatter: true,
    });
  });
});
