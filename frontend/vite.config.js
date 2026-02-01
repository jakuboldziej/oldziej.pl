import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiUrl = mode === "development" ? env.VITE_BACKEND_DOMAIN_LOCAL : env.VITE_BACKEND_DOMAIN;

  return {
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ["legacy-js-api"],
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: mode === "development",
        },
      },
      allowedHosts: ["merely-meet-muskrat.ngrok-free.app"]
    },
  };
});