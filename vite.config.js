import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Utility function for path resolution
const resolvePath = (dir) => resolve(__dirname, dir);

export default defineConfig({
  // React plugin configuration
  plugins: [react()],

  // Root directory and public assets configuration
  root: 'src',
  publicDir: '../public',

  // Build configuration
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolvePath('src/index.html')
      }
    },
    // Ensure build works in Docker
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  },

  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': resolvePath('./src'),
      '@assets': resolvePath('./assets'),
      '@components': resolvePath('./src/components'),
      '@styles': resolvePath('./src/styles')
    }
  },

  // CSS configuration including SCSS and CSS modules
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/scss/main.scss";`
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Development server configuration
  server: {
    watch: {
      usePolling: true,
      interval: 1000
    },
    host: true, // Expose to all network interfaces
    port: 5173,
    open: true,
    strictPort: true, // Don't try another port if 5173 is taken
    cors: true // Enable CORS
  }
});
