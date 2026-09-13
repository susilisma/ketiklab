import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" keeps asset URLs relative so the build works at
// https://<user>.github.io/<repo>/ without hard-coding the repo name.
// public/sw.js is copied verbatim, so without a per-build VERSION every deploy
// ships byte-identical worker code, the browser never reinstalls it, and caches
// from earlier deploys are never dropped.
const swVersion = () => ({
  name: "sw-version",
  apply: "build" as const,
  closeBundle() {
    const file = resolve("dist/sw.js");
    const stamp = Date.now().toString(36);
    writeFileSync(file, readFileSync(file, "utf8").replace(/const VERSION = "[^"]*"/, `const VERSION = "kl-${stamp}"`));
  },
});

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), swVersion()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
