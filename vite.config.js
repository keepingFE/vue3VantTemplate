import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import postcssPxtorem from 'postcss-pxtorem'
import { viteMockServe } from 'vite-plugin-mock'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  const useMock = env.VITE_USE_MOCK === 'true'
  const enableSourceMap = env.VITE_BUILD_SOURCEMAP === 'true'

  return {
    plugins: [
      vue(),

      // 自动导入 Vue API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      }),

      // 自动导入 Vant 组件
      Components({
        resolvers: [VantResolver()],
        dts: 'src/components.d.ts'
      }),

      // 压缩
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240  // 10KB 以上才压缩
      }),

      // 构建分析
      /*
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      }),
      */
     
      // Mock 数据服务
      viteMockServe({
        mockPath: 'mock',
        enable: useMock && command === 'serve', // 根据环境变量控制是否启用
        watchFiles: true, // 监听文件变化
        logger: true // 显示请求日志
      })
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
        '@assets': resolve(__dirname, 'src/assets')
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
            exclude: filePath => /node_modules/i.test(filePath) && !filePath.includes('vant')
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
      // 只有在不使用 Mock 时才启用 proxy
      proxy: useMock
        ? {}
        : {
            '/api': {
              target: 'http://localhost:8080',
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api/, '')
            }
          }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: enableSourceMap,
      minify: 'terser',
      cssCodeSplit: false, // 所有 CSS 打包到一个文件
      reportCompressedSize: false,
      target: 'es2019',
      cssTarget: 'ios12',
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'vant-vendor': ['vant'],
            // 将 pdfjs-dist 单独打包，避免影响主包大小
            'pdfjs': ['pdfjs-dist'],
            'echarts': ['echarts', 'vue-echarts'],
            'markdown': ['markdown-it', 'highlight.js']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },

    // 优化配置
    optimizeDeps: {
      include: ['pdfjs-dist', 'echarts', 'vue-echarts', 'markdown-it', 'highlight.js'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      legalComments: 'none'
    }
  }
})
