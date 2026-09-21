import type { OxfmtConfig } from "oxfmt";

import settings from "./settings.ts";

export default function bachmanDev(overrides?: OxfmtConfig): OxfmtConfig {
  const config: OxfmtConfig = {};
  for (const [key, value] of Object.entries(settings)) {
    if (typeof value.setting !== "undefined") {
      config[key] = value.setting;
    }
  }
  return { ...config, ...overrides };
}
