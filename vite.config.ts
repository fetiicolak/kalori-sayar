/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.GITHUB_ACTIONS === 'true' ? '/kalori-sayar/' : '/'

export default defineConfig({
  base,
  build: { chunkSizeWarningLimit: 600 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'Kalori Sayar',
        short_name: 'Kalori',
        description: 'Kalori ve makro takibini kolaylaştıran mobil öncelikli PWA.',
        theme_color: '#13261f',
        background_color: '#f7f6f1',
        display: 'standalone',
        start_url: base,
        lang: 'tr',
        categories: ['health', 'fitness', 'lifestyle'],
        icons: [
          { src: `${base}logo.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: `${base}logo-maskable.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: `${base}index.html`,
        globPatterns: ['**/*.{js,css,html,svg,woff2}']
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: { reporter: ['text', 'html'] }
  }
})
