import { resolve, join } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(() => {
  return {
    root: join(process.cwd(), "./web"),
    plugins: [
      svelte({
        compilerOptions: {
          hydratable: true /* required for clientside hydration */,
        },
      }),
    ],
    build: {
      target: "esnext",
      minify: process.env.MODE === "development" ? false : "terser",
      outDir: "../dist/ssr",
      emptyOutDir: true,
      assetsInlineLimit: 0,
    },
    server: {
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100,
      },
      port: 2345,
    },
  };
});
