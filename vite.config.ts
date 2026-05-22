import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const isTruthyEnv = (value?: string) =>
  value?.toLowerCase() === "true" ||
  value?.toLowerCase() === "1" ||
  value?.toLowerCase() === "yes" ||
  value?.toLowerCase() === "on";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false,
      registerType: "autoUpdate",
      manifest: {
        name: "잔반제로",
        short_name: "잔반제로",
        description:
          "AI로 식사 기록, 잔반 리뷰, 보관 식재료, 레시피 추천을 연결하는 모바일 PWA.",
        theme_color: "#BDBB40",
        background_color: "#FAFAF1",
        display: "standalone",
        lang: "ko",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: {
    host: isTruthyEnv(process.env.VITE_DEV_SERVER_HOST) ? true : undefined,
  },
});
