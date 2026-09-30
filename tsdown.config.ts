import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  copy: "./LICENSE",
  dts: { generator: "oxc", sourcemap: false },
  entry: ["src/oxfmt/index.ts", "src/oxlint/index.ts"],
  exports: true,
  format: "esm",
});
