import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@services': path.resolve(__dirname, './src/services'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@config': path.resolve(__dirname, './src/config'),
      '@types': path.resolve(__dirname, './src'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {},
  optimizeDeps: {
    exclude: ['@capacitor/device', '@capacitor/core', '@capacitor/app'],
  },
  build: {
    rollupOptions: {
      external: ['@capacitor/device', '@capacitor/core', '@capacitor/app'],
    },
  },
})
