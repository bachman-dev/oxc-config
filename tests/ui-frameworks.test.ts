import * as fsPromises from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

import type { OxlintConfig, OxlintOverride } from "oxlint";
import { describe, expect, it, vi } from "vitest";

import bachmanDev from "../src/oxfmt/index.ts";
import bachmanDevConfig from "../src/oxlint/index.ts";

// Most tests here only build a config, but a few run oxlint itself against a component
vi.setConfig({ testTimeout: 10_000 });

const OXLINT_DIRECTORY = path.dirname(createRequire(import.meta.url).resolve("oxlint/package.json"));

const ASTRO_GLOB = "**/*.astro";

const ASTRO_GLOBS = [ASTRO_GLOB];

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

// The rules our rule groups set differently for Astro components
const ASTRO_RULES = ["import/unambiguous", "no-implicit-globals", "unicorn/filename-case"];

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

function findAstroOverrides(config: OxlintConfig): OxlintOverride[] {
  return (config.overrides ?? []).filter((override) => override.files.includes(ASTRO_GLOB));
}

function findAstroEnvOverrides(config: OxlintConfig): OxlintOverride[] {
  return findAstroOverrides(config).filter((override) => typeof override.env === "object");
}

function getAstroRuleNames(config: OxlintConfig): string[] {
  return findAstroOverrides(config).flatMap((override) => Object.keys(override.rules ?? {}));
}

// Type-aware linting needs a tsconfig and tsgolint; the Astro override doesn't depend on either
const NOT_TYPE_AWARE = { options: { typeAware: false, typeCheck: false } };

describe("oxlint uiFrameworks", () => {
  it("adds no override for Astro components by default", () => {
    expect(findAstroOverrides(bachmanDevConfig())).toStrictEqual([]);
  });

  it("sets the Astro environments when astro is listed", () => {
    expect(findAstroEnvOverrides(bachmanDevConfig({ uiFrameworks: ["astro"] }))).toStrictEqual([
      { files: ASTRO_GLOBS, env: { astro: true, browser: true } },
    ]);
  });

  it("turns on the Astro rule overrides when astro is listed", () => {
    expect(getAstroRuleNames(bachmanDevConfig({ uiFrameworks: ["astro"] })).toSorted()).toStrictEqual(ASTRO_RULES);
  });

  it("sets the Astro environments once when astro is listed twice", () => {
    expect(findAstroEnvOverrides(bachmanDevConfig({ uiFrameworks: ["astro", "astro"] }))).toHaveLength(1);
  });

  it("leaves out rule overrides from plugins that are turned off", () => {
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
    expect(bachmanDev({ uiFrameworks: ["astro"] }).astro).toStrictEqual({
      allowShorthand: true,
      compressHTML: "jsx",
      skipFrontmatter: false,
    });
  });

  it("lets the user's own astro setting win", () => {
    expect(bachmanDev({ uiFrameworks: ["astro"] }, { astro: { skipFrontmatter: true } }).astro).toStrictEqual({
      skipFrontmatter: true,
    });
  });
});
