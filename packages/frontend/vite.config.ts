import { fileURLToPath, URL } from "node:url";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    // enable jest-like global test APIs
    setupFiles: ["./vitest.setup.ts"],
    environment: "happy-dom",
    globals: true,
  },
  plugins: [
    vue(),
    VueI18nPlugin({}),
    VitePWA({
      strategies: "injectManifest",
      filename: "sw.ts",
      srcDir: "src",
      workbox: {
        disableDevLogs: true,
      },
      // Controls whether the browser should update the pwa automatically, or prompt the user
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      injectManifest: {
        rollupFormat: "iife",
        injectionPoint: undefined,
      },
      manifest: {
        name: "Aula Virtual Anclademia",
        short_name: "Anclademia",
        description: "Bienvenido al Aula Virtual Anclademia",
        theme_color: "#ffffff",
        icons: [
          {
            src: "media/logos/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "media/logos/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "media/logos/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "media/logos/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/",
  build: {
    chunkSizeWarningLimit: 3000,
    target: "es2018",
  },
});
