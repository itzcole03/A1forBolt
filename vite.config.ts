import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@stores": path.resolve(__dirname, "src/stores"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
});
