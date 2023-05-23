import { resolve, join } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  root: join(process.cwd(), "./web"),
  publicDir: "public",
  server: {
    port: 2345,
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      // compilerOptions: {
      //   // generate: "ssr",
      //   // hydratable: true,
      // }
    }),
  ],
  build: {
    outDir: "../dist/web",
    minify: process.env.MODE === "development" ? false : "terser",
    lib: {
      // name: 'mstmer',
      entry: "index.html",
      // entry: resolve(process.cwd(), 'web/lib/main.ts'),
      formats: ["esm"],
      fileName: "web",
    },
    // rollupOptions: {
    //   input: resolve(process.cwd(), 'web/lib/main.ts'),
    // },
    // ssr: true,
    emptyOutDir: true,
    copyPublicDir: true,
  },
});
