import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [],
    exclude: ['@bydavito/map-core', 'maplibre-gl'],
  },
  ssr: {
    noExternal: [],
    external: ['react', 'react-dom', 'maplibre-gl'],
  },
})
