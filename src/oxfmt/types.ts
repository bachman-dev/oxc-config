import type { OxfmtConfig } from "oxfmt";

import type { Admonishment, RemoveIndex } from "../types.ts";

export type OxfmtConfigMetaData = {
  [Setting in keyof RemoveIndex<Required<OxfmtConfig>>]: {
    explanation: string | [first: string, ...rest: string[]];
    setting: OxfmtConfig[Setting];
    admonishments?: [first: Admonishment, ...rest: Admonishment[]];
  };
};
