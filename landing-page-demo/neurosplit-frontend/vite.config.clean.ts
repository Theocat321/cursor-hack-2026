import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function rewriteToCleanHtml(): Plugin {
  return {
    name: 'rewrite-to-clean-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/clean.html'
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [rewriteToCleanHtml(), react(), tailwindcss()],
  server: {
    port: 6002,
  },
  build: {
    rollupOptions: {
      input: 'clean.html',
    },
  },
})
