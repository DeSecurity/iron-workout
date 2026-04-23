import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages deploys under /Iron-Workout/. Lovable preview/dev serve from root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Iron-Workout/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
