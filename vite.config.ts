import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
  const gas = mode === "gas";
  return {
    base: "./",
    plugins: [react(), tailwindcss(), ...(gas ? [viteSingleFile()] : [])],
    build: gas
      ? {
          outDir: "dist-gas",
          emptyOutDir: true,
          cssCodeSplit: false,
          assetsInlineLimit: 100_000_000,
          rollupOptions: {
            output: {
              format: "iife",
              inlineDynamicImports: true,
            },
          },
        }
      : {},
    server: {
      host: "127.0.0.1",
      port: 5180,
    },
  };
});
