import { resolve, join } from "path";
import { defineConfig } from "vite";
import swc from "rollup-plugin-swc";

export default defineConfig({
  root: join(process.cwd(), "./server"),
  server: {
    port: 1234,
  },
  plugins: [
    swc({
      root: join(process.cwd(), "./server"),
      minify: process.env.MODE !== "development",
      // minify: false,
      jsc: {
        parser: {
          syntax: "typescript",
          dynamicImport: true,
          decorators: true,
        },
        target: "es6",
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
  ],
  esbuild: false,
  build: {
    // rollupOptions: {
    //   input: 'server/src/index.ts',
    //   output: {
    //     dir: '../dist/server',
    //     format: 'commonjs'
    //   }
    // },
    outDir: "../dist/server",
    minify: process.env.MODE === "development" ? false : "terser",
    lib: {
      entry: "src/index.ts",
      formats: ["cjs"],
      fileName: "server",
    },
    emptyOutDir: true,
  },
});
