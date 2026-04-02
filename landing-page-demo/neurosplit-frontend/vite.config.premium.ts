import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function rewriteToPremiumHtml(): Plugin {
  return {
    name: 'rewrite-to-premium-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/premium.html'
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [rewriteToPremiumHtml(), react(), tailwindcss()],
  server: {
    port: 6003,
  },
  build: {
    rollupOptions: {
      input: 'premium.html',
    },
  },
})
