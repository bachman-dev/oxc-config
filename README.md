# @bachman-dev/oxc-config

This project provides the following oxc shared configurations:

| Tool   | Description                                                                           | Settings |
| ------ | ------------------------------------------------------------------------------------- | -------- |
| oxfmt  | Used for formatting code and other documents in a codebase                            | View     |
| oxlint | Enforces code style and quality by checking for errors and offering suggestions/fixes | View     |

## Install

Make sure the following are added to your project's devDependencies:

```shell
pnpm add --save-dev --save-exact typescript oxfmt oxlint oxlint-tsgolint @bachman-dev/oxc-config
```

We assume that your `tsconfig.json` has the following type-checking settings configured:

```jsonc
{
  "compilerOptions": {
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "strict": true,
    "useUnknownInCatchVariables": true,
    "target": "es2025", // or newer
  },
}
```

In your `oxfmt.config.ts` file, extend from the `bachmanDev` config method:

```ts
import bachmanDev from "@bachman-dev/oxc-config/oxfmt";
import { defineConfig } from "oxfmt";

export default defineConfig(bachmanDev());
```

The method accepts an oxfmt configuration object in case you need to override any global settings or add overrides for specific files:

```ts
import bachmanDev from "@bachman-dev/oxc-config/oxfmt";
import { defineConfig } from "oxfmt";

export default defineConfig(
  bachmanDev({ useTabs: true, overrides: [{ files: ["**/*.md"], options: { proseWrap: "never" } }] }),
);
```

In your `oxlint.config.ts` file, set a default export of the `bachmanDev` config method:

```ts
import { bachmanDevConfig, jsdocSettings } from "@bachman-dev/oxc-config/oxlint";
import { type OxlintConfig, defineConfig } from "oxlint";

export default bachmanDevConfig();
```

You can enable or disable certain sets of rules by passing a configuration object, setting the respective plugin name to `true` or `false`; for Vitest rules, you can also specify an array of glob patterns to evaluate test files if the default globs `["**/*.test.{ts,tsx,mts,cts}", "**/*.test-d.{ts,tsx,mts,cts}"]` are not suitable for your project.

```ts
import bachmanDevConfig from "@bachman-dev/oxc-config/oxlint";

export default bachmanDevConfig({ vitest: false });
```

If the project needs a config change, you can override any oxlint settings by passing an override config as the second parameter.

```ts
import bachmanDevConfig from "@bachman-dev/oxc-config/oxlint";

export default bachmanDevConfig({ vitest: true }, { options: { typeAware: false, typeCheck: false } });
```

## What's Changed from the ESLint Config

Because of how oxlint differs from (typescript-)eslint, and a desire to make some changes to our coding style in general, there are some differences from the ESLint config:

- The `language` setting has been removed due to oxlint not requiring us to juggle parser logic; instead, we disable some rules for TypeScript files using overrides -- either because they're checked by TypeScript, or are covered by a different/better `typescript` rule.
- The `allowBitwise` option has been removed, and the `no-bitwise` rule is always enabled by this config; going forward we plan to either keep our bitwise operations to very specific areas such that they can be disabled by line/file, or use external libraries (eg for Discord permission calculations).
- The `allowConsole` option has been removed, and the `no-console` rule is always enabled by this config; going forward, we expect either to create a logger that keeps our console usage to a single location, or we'll use a logging library such as [pino](https://getpino.io/#/) for more advanced logging needs. For console/cli apps, we'll use libraries ranging from basic text output to advanced TUI design as needed.
- We now specify all configuration options for a rule so long as is practical, so that linter updates don't yield any surprise config changes
- Oxlint uses different rule categories, and doesn't have certain rules enabled by default; we've combed through the rules and made sure they were enabled with any parent plugin's defaults.
- Oxlint includes built-in plugin ports from across the ESLint ecosystem, so we've enabled many more rules from those built-in plugins.
