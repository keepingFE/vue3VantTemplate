import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import postcssPxtorem from 'postcss-pxtorem'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入 Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    
    // 自动导入 Vant 组件
    Components({
      resolvers: [VantResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
      '@store': resolve(__dirname, 'src/store'),
      '@assets': resolve(__dirname, 'src/assets'),
    }
  },
  
  // CSS 配置
  css: {
    postcss: {
      plugins: [
        postcssPxtorem({
          rootValue: 37.5, // 375 设计稿基准；若设计稿标注为 750px，请先除以 2
          propList: ['*'], // 需要转换的属性
          selectorBlackList: [], // 保持 Vant 也参与 rem 适配，避免和自定义样式缩放不一致
          // 仅排除非 Vant 的 node_modules，保证 Vant 也参与 rem 转换
          exclude: (filePath) => /node_modules/i.test(filePath) && !filePath.includes('vant'),
        })
      ]
    },
    preprocessorOptions: {
      scss: {
        // 使用 @use 可以避免循环引用问题
        additionalData: `@use "@/assets/styles/variables.scss" as *;`
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vant-vendor': ['vant']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})

