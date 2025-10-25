import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const brandName = process.env.VITE_BRAND_NAME || 'متجر حديث'
  const themeColor = '#FF6F61'
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'placeholder.svg'],
        manifest: {
          name: brandName,
          short_name: brandName,
          description: 'تسوق بسهولة عبر تطبيق الويب',
          lang: 'ar',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          theme_color: themeColor,
          background_color: '#0B1220',
          icons: [
            { src: '/logo.png', sizes: '192x192', type: 'image/png' },
            { src: '/logo.png', sizes: '256x256', type: 'image/png' },
            { src: '/logo.png', sizes: '384x384', type: 'image/png' },
            { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico,webp}']
        }
      })
    ],
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      open: true
    }
  }
})
