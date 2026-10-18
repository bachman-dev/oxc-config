import type { OxfmtConfig } from "oxfmt";

import type { Admonishment, RemoveIndex, UiFramework } from "../types.ts";

export type OxfmtConfigMetaData = {
  [Setting in keyof RemoveIndex<Required<OxfmtConfig>>]: {
    explanation: string | [first: string, ...rest: string[]];
    setting: OxfmtConfig[Setting];
    admonishments?: [first: Admonishment, ...rest: Admonishment[]];
  };
};

export interface OxfmtConfigOptions {
  uiFrameworks?: UiFramework[];
}

export interface OxfmtUiFrameworkMetadata {
  name: string;
  settings: Partial<OxfmtConfigMetaData>;
  admonishments?: [first: Admonishment, ...rest: Admonishment[]];
}
