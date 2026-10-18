import type { OxfmtConfig } from "oxfmt";

import settings from "./settings.ts";
import type { OxfmtConfigMetaData, OxfmtConfigOptions } from "./types.ts";
import uiFrameworks from "./ui-frameworks.ts";

function applySettings(config: OxfmtConfig, metadata: Partial<OxfmtConfigMetaData>): void {
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value.setting !== "undefined") {
      config[key] = value.setting;
    }
  }
}

export default function bachmanDev(overrides?: OxfmtConfig, options?: OxfmtConfigOptions): OxfmtConfig {
  const config: OxfmtConfig = {};
  applySettings(config, settings);
  for (const framework of options?.uiFrameworks ?? []) {
    applySettings(config, uiFrameworks[framework].settings);
  }
  return { ...config, ...overrides };
}

// Re-exported so a consumer's `oxfmt.config.ts` can name the type in this module's public signature; see the same
// re-export in `src/oxlint/index.ts` for why TypeScript needs it.
export type { OxfmtConfig } from "oxfmt";
export type { UiFramework } from "../types.ts";
export type { OxfmtConfigOptions } from "./types.ts";
