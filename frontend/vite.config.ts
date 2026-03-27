import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifest: false,
      filename: 'sw.js',
      strategies: 'generateSW',
      workbox: {
        importScripts: ['sw-push.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['sw-push.js', 'sw.js', 'workbox-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./src/components/tremor"),
      "@": path.resolve(__dirname, "./src"),
      "@tattoocrm/shared": path.resolve(__dirname, "../packages/shared/src"),
    },
  },
})
