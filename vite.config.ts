import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const API_TARGET_URL = "https://1ejrtfddba.execute-api.ap-south-1.amazonaws.com/default";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: API_TARGET_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
