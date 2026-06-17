import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 어린왕자의 작은 소행성 — Vite 설정
// base를 './'로 두어 Capacitor(안드로이드 file://) 및 정적 호스팅 모두에서 동작하게 함
export default defineConfig({
  base: './',
  // 부모 저장소의 postcss.config(@tailwindcss/postcss)를 상속하지 않도록 인라인으로 비움
  css: { postcss: {} },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '어린왕자의 작은 소행성',
        short_name: 'B-612',
        description: '나만의 작은 소행성을 가꾸며 힐링하는 게임',
        lang: 'ko',
        theme_color: '#1a1840',
        background_color: '#0d0c24',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  server: { host: true },
})
