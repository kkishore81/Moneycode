import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('Dashboard.tsx')) {
            return 'dashboard';
          }
          if (id.includes('Investments.tsx')) {
            return 'investments';
          }
          if (id.includes('Calculators')) {
            return 'calculators';
          }
          if (id.includes('Trends')) {
            return 'trends';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  },
})
