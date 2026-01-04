import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    shims: true,
    external: ["commander", "chokidar", "picocolors", "tsx"]
});
