import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  cacheDir: '.vite-cache',

  build: {
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split major frameworks into their own chunks
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@mui') || id.includes('@emotion')) return 'ui-vendor';
            if (id.includes('lodash') || id.includes('axios')) return 'utils-vendor';
            
            // Fallback: Group remaining small node_modules into a general vendor chunk
            // Or return 'vendor' if you want them together
            return 'vendor'; 
          }
        },
      },
    },
  },
});