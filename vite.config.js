import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  // Root directory for source files
  root: '.',
  
  // Base URL for the application
  base: './',
  
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Clean output directory before build
    emptyOutDir: true,
    
    // Generate sourcemaps for debugging
    sourcemap: true,
    
    // Minify the output
    minify: 'terser',
    
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        settings: resolve(__dirname, 'settings.html'),
        test: resolve(__dirname, 'test-code-formatting.html')
      },
      output: {
        // Organize output files
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].[ext]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash].[ext]`;
          }
          
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash].[ext]`;
          }
          
          return `assets/[name]-[hash].[ext]`;
        }
      }
    },
    
    // Target modern browsers but maintain compatibility
    target: 'es2015',
    
    // Asset handling
    assetsDir: 'assets',
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report bundle size
    reportCompressedSize: true,
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  
  // Development server configuration
  server: {
    // Port for development server
    port: 3000,
    
    // Open browser automatically
    open: true,
    
    // Hot module replacement
    hmr: true,
    
    // CORS configuration
    cors: true,
    
    // Host configuration
    host: 'localhost'
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
    cors: true,
    host: 'localhost'
  },
  
  // Plugin configuration
  plugins: [
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
  
  // CSS configuration
  css: {
    // CSS preprocessing
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./assets/css/variables.scss";`
      }
    },
    
    // PostCSS configuration
    postcss: {
      plugins: [
        {
          postcssPlugin: 'custom-css-vars',
          Once(root) {
            // Custom CSS variable handling if needed
          }
        }
      ]
    }
  },
  
  // Static asset handling
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.otf'],
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'assets'),
      '@js': resolve(__dirname, 'assets/js'),
      '@css': resolve(__dirname, 'assets/css'),
      '@images': resolve(__dirname, 'assets/images'),
      '@fonts': resolve(__dirname, 'assets/fonts')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
  },
  
  // Optimization
  optimizeDeps: {
    // Pre-bundle dependencies
    include: ['marked'],
    
    // Force optimization of specific dependencies
    force: false,
    
    // ESBuild options
    esbuildOptions: {
      target: 'es2015'
    }
  },
  
  // Environment variables
  envPrefix: 'LAMP_',
  
  // Logging level
  logLevel: 'info',
  
  // Clear screen on restart
  clearScreen: true
}); 