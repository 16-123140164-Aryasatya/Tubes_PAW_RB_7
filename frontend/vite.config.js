import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Configure the development server to proxy API requests.  When using the
  // Vite dev server on port 5173, calls to ``/api`` will be forwarded to
  // the Pyramid backend running on port 6543.  This eliminates CORS issues
  // during development and allows us to use a relative base URL in our
  // Axios client.  In production builds, this proxy has no effect.
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:6543',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});
