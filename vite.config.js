import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL(".", import.meta.url)), "index.html"),
        classic: resolve(fileURLToPath(new URL(".", import.meta.url)), "modes/classic.html"),
        infinity: resolve(fileURLToPath(new URL(".", import.meta.url)), "modes/infinity.html"),
        quote: resolve(fileURLToPath(new URL(".", import.meta.url)), "modes/quote.html"),
        silhouette: resolve(fileURLToPath(new URL(".", import.meta.url)), "modes/silhouette.html"),
      },
    },
  },
  server: {
    open: true,
  },
});