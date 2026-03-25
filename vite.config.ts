import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://54.116.93.66:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://54.116.93.66:8080",
        changeOrigin: true,
        ws: true,
      },
      "/sim-api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sim-api/, "/api"),
      },
    },
  },
});
