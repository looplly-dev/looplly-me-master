import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manually chunk vendor libraries
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          surveyjs: ['survey-core', 'survey-creator-core', 'survey-creator-react', 'survey-react-ui']
        },
        // Optimize chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Enable minification
    minify: 'esbuild',
    // Source maps for debugging
    sourcemap: mode === 'development',
    // CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for better performance
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1']
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'survey-core',
      'survey-creator-core',
      'survey-creator-react',
      'survey-react-ui'
    ]
  },
  // Preview optimization
  preview: {
    port: 8080,
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
}));
