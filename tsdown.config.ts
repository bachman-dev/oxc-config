import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: { generator: "oxc", sourcemap: false },
  entry: ["src/oxfmt/index.ts", "src/oxlint/index.ts"],
  format: "esm",
});
