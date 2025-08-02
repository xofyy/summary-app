import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5174, // Change port to avoid conflicts
    hmr: false, // Disable HMR to fix WebSocket issues
    open: false,
  },
  plugins: [
    react(),
    // PWA temporarily disabled for development
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png'],
    //   manifest: {
    //     name: 'Akıllı İçerik Özet Uygulaması',
    //     short_name: 'Smart Summary',
    //     description: 'AI destekli kişiselleştirilmiş haber özetleme uygulaması',
    //     theme_color: '#2563eb',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: '/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: ({ request }) => request.destination === 'document',
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'documents'
    //         }
    //       },
    //       {
    //         urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
    //         handler: 'StaleWhileRevalidate',
    //         options: {
    //           cacheName: 'static-resources'
    //         }
    //       }
    //     ]
    //   }
    // })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})