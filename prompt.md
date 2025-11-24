# Vue3 移动端项目生成 Prompt

## 项目概述

请帮我创建一个完整的移动端项目，使用以下技术栈：
- **Vue 3** (Composition API)
- **Vant 4** (移动端 UI 组件库)
- **Vite** (构建工具)
- **Pinia** (状态管理)
- **Vue Router** (路由管理)
- **Vue I18n** (国际化)
- **SCSS** (CSS 预处理器)

## 核心功能要求

### 1. 项目基础架构

#### 1.1 目录结构
```
project-name/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   ├── images/        # 图片
│   │   ├── styles/        # 全局样式 (SCSS)
│   │   │   ├── variables.scss  # 变量定义
│   │   │   ├── mixins.scss     # 混入
│   │   │   ├── common.scss     # 通用样式
│   │   │   └── index.scss      # 样式入口
│   │   └── icons/         # 图标
│   ├── components/        # 公共组件
│   │   ├── common/        # 通用组件
│   │   └── business/      # 业务组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   │   ├── index.js       # 路由主文件
│   │   ├── routes.js      # 路由配置
│   │   └── guards.js      # 路由守卫
│   ├── store/             # Pinia 状态管理
│   │   ├── index.js       # Store 入口
│   │   ├── modules/       # 模块化 Store
│   │   │   ├── user.js    # 用户模块
│   │   │   ├── app.js     # 应用模块
│   │   │   └── permission.js # 权限模块
│   ├── api/               # API 接口
│   │   ├── request.js     # Axios 封装
│   │   └── modules/       # 接口模块
│   ├── utils/             # 工具函数
│   │   ├── auth.js        # 认证工具
│   │   ├── storage.js     # 本地存储
│   │   ├── tools.js       # 工具函数
│   │   ├── validate.js    # 表单验证
│   │   ├── permission.js  # 权限判断
│   │   └── theme.js       # 主题管理
│   ├── config/            # 配置文件
│   │   └── index.js       # 全局配置
│   ├── plugins/           # 插件
│   │   └── vant.js        # Vant 插件配置
│   ├── hooks/             # 组合式函数
│   ├── directives/        # 自定义指令
│   ├── locales/           # 国际化语言包
│   │   ├── index.js       # i18n 配置
│   │   ├── zh-CN.js       # 中文
│   │   └── en-US.js       # 英文
│   ├── constants/         # 常量定义
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── vite.config.js         # Vite 配置
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

#### 1.2 Vite 配置要求
完整的 Vite 配置示例：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import postcssPxtorem from 'postcss-pxtorem'

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
```

**配置说明：**
- ✅ 路径别名配置（@, @components, @views 等）
- ✅ 代理配置解决跨域问题
- ✅ postcss-pxtorem + amfe-flexible 保证 rem 适配
- ✅ 自动导入 Vue API 和 Vant 组件
- ✅ 生产环境打包优化
- ✅ 代码分割和 chunk 优化
- ✅ 打包生成环境，移除 console 和 debugger

### 2. 路由权限管理

#### 2.1 路由配置
- 使用 Vue Router 4
- 支持路由懒加载
- 路由元信息配置：
  ```javascript
  {
    path: '/example',
    name: 'Example',
    component: () => import('@/views/example/index.vue'),
    meta: {
      title: '页面标题',
      requiresAuth: true,      // 是否需要登录
      roles: ['admin', 'user'], // 允许访问的角色
      keepAlive: true,          // 是否缓存
      icon: 'icon-name',        // 图标
      hidden: false,            // 是否在菜单中隐藏
      noCache: false            // 是否不缓存
    }
  }
  ```

#### 2.2 权限管理
- 实现基于角色的权限控制 (RBAC)
- 路由级权限控制（路由守卫）
- 按钮级权限控制（自定义指令 v-permission）
- 动态路由生成
- 权限验证流程：
  1. 登录获取 token 和用户信息
  2. 根据用户角色动态生成可访问路由
  3. 路由守卫验证权限
  4. 无权限时跳转到 403 或登录页

#### 2.3 路由守卫
完整的路由守卫实现示例：
```javascript
// router/guards.js
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { getToken } from '@/utils/auth'
import { showToast } from 'vant'

// 白名单路由
const whiteList = ['/login', '/register', '/404', '/403']

/**
 * 全局前置守卫
 */
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = userStore.token || getToken()
    
    // 设置页面标题
    document.title = to.meta.title || '移动端应用'
    
    // 判断是否需要登录
    if (token) {
      if (!userStore.token) {
        userStore.token = token
      }
      if (to.path === '/login') {
        // 已登录，跳转到首页
        next({ path: '/' })
      } else {
        // 检查是否已获取用户信息
        if (!userStore.userInfo) {
          try {
            // 获取用户信息
            await userStore.getUserInfo()
            
            // 生成动态路由
            const accessRoutes = await permissionStore.generateRoutes(userStore.roles)
            
            // 动态添加路由
            accessRoutes.forEach(route => {
              router.addRoute(route)
            })
            
            // 重新导航到目标路由
            next({ ...to, replace: true })
          } catch (error) {
            // 获取用户信息失败，清除 token 并跳转到登录页
            await userStore.logout()
            showToast('获取用户信息失败，请重新登录')
            next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
          }
        } else {
          // 检查权限
          if (to.meta.roles && to.meta.roles.length > 0) {
            const hasPermission = userStore.roles.some(role => to.meta.roles.includes(role))
            if (!hasPermission) {
              showToast('您没有权限访问该页面')
              next('/403')
              return
            }
          }
          next()
        }
      }
    } else {
      userStore.resetToken()
      // 未登录
      if (whiteList.includes(to.path)) {
        // 在白名单中，直接进入
        next()
      } else {
        // 不在白名单中，跳转到登录页
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    }
  })
  
  // 全局后置守卫
  router.afterEach((to, from) => {
    // 关闭加载进度条
    // NProgress.done()
    
    // 页面滚动到顶部
    window.scrollTo(0, 0)
  })
  
  // 全局错误处理
  router.onError((error) => {
    console.error('路由错误：', error)
    showToast('页面加载失败')
  })
}
```

### 3. 状态管理 (Pinia)

#### 3.1 Store 模块
创建以下 Store 模块：

**User Store (用户模块)**
- 用户信息 (userInfo)
- Token 管理 (token)
- 角色列表 (roles)
- 登录/登出方法
- 获取用户信息方法

**App Store (应用模块)**
- 语言设置 (locale)
- 主题色设置 (themeColor)
- 主题模式设置 (themeMode - 深色/浅色)
- 加载状态 (loading)
- 设备信息 (device)

**Permission Store (权限模块)**
- 路由列表 (routes)
- 权限列表 (permissions)
- 动态路由生成方法

#### 3.2 User Store 完整示例
```javascript
// store/modules/user.js
import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import { getToken, setToken, clearToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null,
    roles: []
  }),
  
  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,
    
    // 用户名
    username: (state) => state.userInfo?.username || '',
    
    // 用户角色
    userRoles: (state) => state.roles
  },
  
  actions: {
    // 登录
    async login(credentials) {
      try {
        const { token, userInfo } = await userApi.login(credentials)
        this.token = token
        this.userInfo = userInfo
        this.roles = userInfo.roles || []
        setToken(token)
        return { token, userInfo }
      } catch (error) {
        throw error
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const userInfo = await userApi.getUserInfo()
        this.userInfo = userInfo
        this.roles = userInfo.roles || []
        return userInfo
      } catch (error) {
        throw error
      }
    },
    
    // 登出
    async logout() {
      try {
        await userApi.logout()
      } catch (error) {
        console.error('登出失败：', error)
      } finally {
        clearToken()
        this.token = ''
        this.userInfo = null
        this.roles = []
      }
    },
    
    // 重置 token
    resetToken() {
      clearToken()
      this.token = ''
      this.userInfo = null
      this.roles = []
    }
  },
  
  // Pinia 持久化配置（pinia-plugin-persistedstate v3.x 语法）
  persist: {
    key: 'user-store', // 与 utils/auth 中的 TOKEN_KEY 保持一致
    storage: localStorage,
    paths: ['token']  // 仅持久化 token，userInfo 每次重新获取
  }
})
```

#### 3.3 持久化
- 使用 pinia-plugin-persistedstate 实现状态持久化
- 配置需要持久化的 Store 和字段

#### 3.4 Store 入口配置示例
```javascript
// store/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```

### 4. 国际化 (i18n)

#### 4.1 配置要求
- 使用 Vue I18n 9.x
- 支持中文、英文（可扩展其他语言）
- 语言切换功能
- 语言持久化存储

#### 4.2 语言包结构
```javascript
// zh-CN.js
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    // ...
  },
  route: {
    home: '首页',
    user: '用户中心',
    // ...
  },
  message: {
    loginSuccess: '登录成功',
    // ...
  }
}
```

#### 4.3 Vant 组件国际化
- 同步 Vant 组件的语言设置
- 语言切换时同步更新 Vant 语言

### 5. 主题色切换

#### 5.1 配置要求
- 支持动态切换主题色
- 使用 CSS 变量实现主题色管理
- Vant 组件主题色同步更新
- 主题色持久化存储
- 提供多套预设主题色方案

#### 5.2 CSS 变量配置
在全局样式中定义 CSS 变量（使用 SCSS）：
```scss
// assets/styles/variables.scss

// ========== CSS 变量定义 ==========
:root {
  /* 主题色 */
  --theme-color: #1989fa;
  --theme-color-light: #66b1ff;
  --theme-color-lighter: #ecf5ff;
  --theme-color-dark: #0d7ce6;
  
  /* 辅助色 */
  --success-color: #07c160;
  --warning-color: #ff976a;
  --danger-color: #ee0a24;
  --info-color: #909399;
  
  /* 文本色 */
  --text-primary: #323233;
  --text-regular: #646566;
  --text-secondary: #969799;
  --text-placeholder: #c8c9cc;
  
  /* 背景色 */
  --bg-color: #f7f8fa;
  --bg-white: #ffffff;
  
  /* 边框色 */
  --border-color: #ebedf0;
}

/* 深色模式 */
[data-theme='dark'] {
  --theme-color: #409eff;
  --text-primary: #e5e5e5;
  --text-regular: #c0c0c0;
  --bg-color: #1a1a1a;
  --bg-white: #2c2c2c;
  --border-color: #4a4a4a;
}

// ========== SCSS 变量定义 ==========
// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 字体大小
$font-size-xs: 10px;
$font-size-sm: 12px;
$font-size-md: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;

// 圆角
$border-radius-sm: 2px;
$border-radius-md: 4px;
$border-radius-lg: 8px;
$border-radius-xl: 12px;

// 阴影
$box-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
$box-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
$box-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);

// Z-index
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;
```

#### 5.3 SCSS 混入（Mixins）
```scss
// assets/styles/mixins.scss

// 文本溢出省略
@mixin ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Flex 布局
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 清除浮动
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 响应式断点
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'phone' {
    @media (max-width: 767px) { @content; }
  }
  @else if $breakpoint == 'tablet' {
    @media (min-width: 768px) and (max-width: 1023px) { @content; }
  }
  @else if $breakpoint == 'desktop' {
    @media (min-width: 1024px) { @content; }
  }
}

// 安全区域适配
@mixin safe-area-inset($property, $direction) {
  #{$property}: constant(safe-area-inset-#{$direction});
  #{$property}: env(safe-area-inset-#{$direction});
}
```

#### 5.4 预设主题色方案
```javascript
// constants/theme.js
export const THEME_COLORS = {
  blue: {
    name: '默认蓝',
    primary: '#1989fa',
    light: '#66b1ff',
    lighter: '#ecf5ff',
    dark: '#0d7ce6'
  },
  green: {
    name: '清新绿',
    primary: '#07c160',
    light: '#39d167',
    lighter: '#e8f9f0',
    dark: '#06ad56'
  },
  purple: {
    name: '优雅紫',
    primary: '#7232dd',
    light: '#9965e4',
    lighter: '#f2ebff',
    dark: '#5e29b8'
  },
  orange: {
    name: '活力橙',
    primary: '#ff976a',
    light: '#ffb088',
    lighter: '#fff3ed',
    dark: '#f57c00'
  },
  red: {
    name: '热情红',
    primary: '#ee0a24',
    light: '#f44336',
    lighter: '#ffebee',
    dark: '#c9001e'
  }
}

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto' // 跟随系统的 prefers-color-scheme
}
```

#### 5.5 Vant 主题定制
使用 ConfigProvider 组件实现 Vant 主题定制：
```javascript
// App.vue
<template>
  <van-config-provider :theme-vars="themeVars">
    <router-view />
  </van-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

const themeVars = computed(() => ({
  primaryColor: appStore.themeColor.primary,
  successColor: '#07c160',
  dangerColor: '#ee0a24',
  warningColor: '#ff976a',
  textColor: 'var(--text-primary)',
  backgroundColor: 'var(--bg-color)',
  borderColor: 'var(--border-color)'
}))
</script>
```

#### 5.6 覆盖 Vant 组件样式

在自定义页面和组件中，有多种方式可以覆盖 Vant 组件的默认样式：

##### 方法一：使用深度选择器（推荐）

在 Vue 3 中使用 `:deep()` 伪类选择器覆盖组件样式：

```vue
<template>
  <div class="custom-page">
    <van-button type="primary">自定义按钮</van-button>
    <van-cell title="自定义单元格" />
  </div>
</template>

<style lang="scss" scoped>
.custom-page {
  // 使用 :deep() 深度选择器覆盖 Vant 组件样式
  :deep(.van-button--primary) {
    background-color: #ff6b6b;
    border-color: #ff6b6b;
    border-radius: 20px;
    
    &:active {
      background-color: #ee5a52;
    }
  }
  
  :deep(.van-cell) {
    padding: 20px 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 12px;
    
    .van-cell__title {
      color: #2c3e50;
      font-weight: 600;
    }
  }
}
</style>
```

##### 方法二：添加自定义类名

通过 Vant 组件的 `class` 属性添加自定义类名：

```vue
<template>
  <div class="page">
    <van-button class="my-button" type="primary">自定义按钮</van-button>
    <van-field 
      class="my-input"
      v-model="value" 
      placeholder="请输入内容" 
    />
  </div>
</template>

<style lang="scss" scoped>
// 直接针对自定义类名编写样式
.my-button {
  width: 200px;
  height: 48px;
  font-size: 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  
  &:active {
    opacity: 0.8;
  }
}

.my-input {
  :deep(.van-field__control) {
    font-size: 16px;
    color: #333;
  }
  
  :deep(.van-field__label) {
    color: #666;
    font-weight: 500;
  }
}
</style>
```

##### 方法三：使用全局样式覆盖

在全局样式文件中覆盖（适用于需要全局统一样式的场景）：

```scss
// assets/styles/vant-override.scss

// 全局覆盖 Vant 按钮样式
.van-button {
  border-radius: 8px;
  font-weight: 500;
  
  &--primary {
    background-color: var(--theme-color);
    border-color: var(--theme-color);
  }
  
  &--large {
    height: 48px;
    font-size: 16px;
  }
}

// 全局覆盖 Vant 导航栏样式
.van-nav-bar {
  background-color: var(--bg-white);
  
  .van-nav-bar__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

// 全局覆盖 Vant 单元格样式
.van-cell {
  padding: 16px;
  
  &::after {
    border-color: var(--border-color);
  }
}

// 全局覆盖 Vant 表单项样式
.van-field {
  padding: 12px 16px;
  
  .van-field__label {
    color: var(--text-regular);
  }
  
  .van-field__control {
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-placeholder);
    }
  }
}
```

然后在 `main.js` 中引入：

```javascript
// main.js
import './assets/styles/vant-override.scss'
```

##### 方法四：使用 CSS 变量动态覆盖

利用 Vant 4 的 CSS 变量特性进行动态覆盖：

```vue
<template>
  <div class="themed-container">
    <van-button type="primary">主题按钮</van-button>
    <van-dialog v-model:show="showDialog" title="自定义对话框">
      内容
    </van-dialog>
  </div>
</template>

<style lang="scss" scoped>
.themed-container {
  // 覆盖 Vant 的 CSS 变量
  --van-button-primary-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --van-button-primary-border-color: transparent;
  --van-button-border-radius: 20px;
  --van-button-default-height: 44px;
  
  --van-dialog-border-radius: 16px;
  --van-dialog-header-font-weight: 600;
  --van-dialog-header-padding-top: 24px;
}
</style>
```

##### 方法五：组合使用 ConfigProvider（局部主题）

使用 Vant 的 ConfigProvider 组件为特定区域设置主题：

```vue
<template>
  <van-config-provider :theme-vars="customThemeVars">
    <div class="custom-section">
      <van-button type="primary">局部主题按钮</van-button>
      <van-cell title="局部主题单元格" />
    </div>
  </van-config-provider>
</template>

<script setup>
import { ref } from 'vue'

const customThemeVars = ref({
  buttonPrimaryBackground: '#07c160',
  buttonPrimaryBorderColor: '#07c160',
  buttonBorderRadius: '12px',
  cellFontSize: '16px',
  cellLineHeight: '24px'
})
</script>
```

##### 最佳实践建议

1. **优先级选择**：
   - 局部样式调整 → 使用深度选择器（`:deep()`）
   - 全局统一样式 → 创建 `vant-override.scss` 全局覆盖
   - 动态主题切换 → 使用 CSS 变量 + ConfigProvider

2. **避免直接修改 node_modules**：
   - ❌ 不要直接修改 `node_modules/vant` 中的源码
   - ✅ 使用样式覆盖的方式实现自定义

3. **保持样式隔离**：
   - 使用 `scoped` 避免样式污染
   - 必要时使用深度选择器 `:deep()` 穿透

4. **利用 SCSS 变量**：
   ```scss
   // 定义自定义变量
   $custom-primary: #1989fa;
   $custom-radius: 8px;
   
   .my-component {
     :deep(.van-button--primary) {
       background-color: $custom-primary;
       border-radius: $custom-radius;
     }
   }
   ```

5. **响应式覆盖**：
   ```scss
   .custom-page {
     :deep(.van-button) {
       width: 100%;
       
       @media (min-width: 768px) {
         width: auto;
         min-width: 120px;
       }
     }
   }
   ```

##### 常见组件样式覆盖示例

```vue
<template>
  <div class="demo-page">
    <!-- 导航栏 -->
    <van-nav-bar class="custom-navbar" title="自定义标题" />
    
    <!-- 标签页 -->
    <van-tabs class="custom-tabs">
      <van-tab title="标签1">内容1</van-tab>
      <van-tab title="标签2">内容2</van-tab>
    </van-tabs>
    
    <!-- 列表 -->
    <van-list class="custom-list">
      <van-cell v-for="item in 5" :key="item" :title="`项目 ${item}`" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.demo-page {
  // 导航栏样式覆盖
  .custom-navbar {
    :deep(.van-nav-bar) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      .van-nav-bar__title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }
      
      .van-icon {
        color: #fff;
      }
    }
  }
  
  // 标签页样式覆盖
  .custom-tabs {
    :deep(.van-tabs__nav) {
      background-color: #f8f9fa;
    }
    
    :deep(.van-tab) {
      color: #666;
      font-weight: 500;
      
      &--active {
        color: #1989fa;
        font-weight: 600;
      }
    }
    
    :deep(.van-tabs__line) {
      background-color: #1989fa;
      height: 3px;
      border-radius: 3px;
    }
  }
  
  // 列表样式覆盖
  .custom-list {
    :deep(.van-cell) {
      padding: 16px;
      background-color: #fff;
      border-radius: 8px;
      margin: 8px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      &::after {
        display: none; // 隐藏默认边框
      }
      
      &:active {
        background-color: #f8f9fa;
      }
    }
  }
}
</style>
```

#### 5.7 主题色管理工具
```javascript
// utils/theme.js
import { THEME_COLORS } from '@/constants/theme'

/**
 * 设置主题色
 * @param {string} colorKey - 主题色键名
 */
export function setThemeColor(colorKey) {
  const themeColor = THEME_COLORS[colorKey]
  if (!themeColor) return
  
  const root = document.documentElement
  root.style.setProperty('--theme-color', themeColor.primary)
  root.style.setProperty('--theme-color-light', themeColor.light)
  root.style.setProperty('--theme-color-lighter', themeColor.lighter)
  root.style.setProperty('--theme-color-dark', themeColor.dark)
}

let mediaQuery
let autoThemeChangeHandler

/**
 * 设置主题模式（深色/浅色）
 * @param {string} mode - 主题模式
 */
export function setThemeMode(mode) {
  const root = document.documentElement
  const apply = (isDark) => {
    if (isDark) {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
  }

  if (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = mediaQuery || window.matchMedia('(prefers-color-scheme: dark)')
    apply(mediaQuery.matches)
    autoThemeChangeHandler =
      autoThemeChangeHandler ||
      ((event) => {
        apply(event.matches)
      })
    mediaQuery.removeEventListener?.('change', autoThemeChangeHandler)
    mediaQuery.addEventListener?.('change', autoThemeChangeHandler)
    root.setAttribute('data-theme-mode', 'auto')
    return
  }

  if (mediaQuery && autoThemeChangeHandler) {
    mediaQuery.removeEventListener?.('change', autoThemeChangeHandler)
  }
  apply(mode === 'dark')
  root.setAttribute('data-theme-mode', mode)
}

/**
 * 获取当前主题色
 */
export function getCurrentThemeColor() {
  const root = document.documentElement
  return getComputedStyle(root).getPropertyValue('--theme-color').trim()
}
```

#### 5.8 useTheme 组合式函数
```javascript
// hooks/useTheme.js
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { THEME_COLORS, THEME_MODES } from '@/constants/theme'

export function useTheme() {
  const appStore = useAppStore()
  
  // 当前主题色
  const currentThemeColor = computed(() => appStore.themeColor)
  
  // 当前主题模式
  const currentThemeMode = computed(() => appStore.themeMode)
  
  // 切换主题色
  const changeThemeColor = (colorKey) => {
    if (!THEME_COLORS[colorKey]) return
    
    appStore.setThemeColor(colorKey)
  }
  
  // 切换主题模式
  const changeThemeMode = (mode) => {
    appStore.setThemeMode(mode)
  }
  
  // 启动时同步持久化的主题到 CSS 变量
  const initTheme = () => {
    changeThemeColor(appStore.themeColorKey)
    changeThemeMode(appStore.themeMode)
  }
  
  // 获取所有主题色
  const getAllThemeColors = () => {
    return Object.entries(THEME_COLORS).map(([key, value]) => ({
      key,
      ...value
    }))
  }
  
  return {
    currentThemeColor,
    currentThemeMode,
    changeThemeColor,
    changeThemeMode,
    initTheme,
    getAllThemeColors,
    THEME_COLORS,
    THEME_MODES
  }
}
```

> 在应用入口（如 `main.js`）调用一次 `initTheme()`，让刷新后也能同步持久化的主题设置到 CSS 变量与 Vant 主题：
```javascript
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
appStore.initTheme()
```

#### 5.9 App Store 主题管理
```javascript
// store/modules/app.js
import { defineStore } from 'pinia'
import { THEME_COLORS, THEME_MODES } from '@/constants/theme'
import { setThemeColor as applyThemeColor, setThemeMode as applyThemeMode } from '@/utils/theme'

export const useAppStore = defineStore('app', {
  state: () => ({
    locale: 'zh-CN',
    themeColorKey: 'blue',
    themeColor: THEME_COLORS.blue,
    themeMode: THEME_MODES.LIGHT,
    loading: false,
    device: 'mobile'
  }),
  
  actions: {
    setThemeColor(colorKey) {
      const key = THEME_COLORS[colorKey] ? colorKey : 'blue'
      this.themeColorKey = key
      this.themeColor = THEME_COLORS[key]
      applyThemeColor(key)
    },
    
    setThemeMode(mode) {
      const safeMode = Object.values(THEME_MODES).includes(mode) ? mode : THEME_MODES.LIGHT
      this.themeMode = safeMode
      applyThemeMode(safeMode)
    },
    
    setLocale(locale) {
      this.locale = locale
    },
    
    // 在应用启动时调用，使用持久化的值同步 CSS 变量
    initTheme() {
      this.setThemeColor(this.themeColorKey)
      this.setThemeMode(this.themeMode)
    }
  },
  
  // Pinia 持久化配置（pinia-plugin-persistedstate v3.x 语法）
  persist: {
    key: 'app-store',
    storage: localStorage,
    paths: ['locale', 'themeColorKey', 'themeMode']
  }
})
```

### 6. API 请求封装

#### 6.0 Token 工具（避免请求与 Store 循环依赖）
```javascript
// utils/auth.js
const TOKEN_KEY = 'user-store' // 与 pinia 持久化 key 保持一致

export const getToken = () => {
  const cache = localStorage.getItem(TOKEN_KEY)
  if (!cache) return ''
  try {
    const parsed = JSON.parse(cache)
    return parsed?.token || ''
  } catch (error) {
    console.error('Token 解析失败：', error)
    return ''
  }
}

export const setToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token }))
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}
```

#### 6.1 Axios 封装
完整的 Axios 封装示例：
```javascript
// api/request.js
import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getToken, clearToken } from '@/utils/auth'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加 token
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 显示 loading
    if (config.loading !== false) {
      showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0
      })
    }
    
    return config
  },
  error => {
    closeToast()
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    closeToast()
    const { code, data, message } = response.data
    
    // 根据业务状态码处理
    if (code === 200 || code === 0) {
      return data
    } else if (code === 401) {
      // token 过期
      clearToken()
      const redirect = router.currentRoute?.value?.fullPath || '/'
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
      showToast('登录已过期，请重新登录')
      return Promise.reject(new Error(message || '登录已过期'))
    } else {
      showToast(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    closeToast()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          showToast(data.message || '请求参数错误')
          break
        case 401:
          showToast('未授权，请重新登录')
          clearToken()
          {
            const redirect = router.currentRoute?.value?.fullPath || '/'
            router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
          }
          break
        case 403:
          showToast('拒绝访问')
          break
        case 404:
          showToast('请求资源不存在')
          break
        case 500:
          showToast('服务器错误')
          break
        default:
          showToast(data.message || '请求失败')
      }
    } else if (error.message.includes('timeout')) {
      showToast('请求超时，请稍后重试')
    } else if (error.message.includes('Network Error')) {
      showToast('网络连接失败')
    } else {
      showToast('请求失败，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

export default service
```

#### 6.2 API 模块化
```javascript
// api/modules/user.js
import request from '../request'

export const userApi = {
  // 登录
  login: (data) => request.post('/user/login', data),
  
  // 获取用户信息
  getUserInfo: () => request.get('/user/info'),
  
  // 登出
  logout: () => request.post('/user/logout'),
  
  // 更新用户信息
  updateUserInfo: (data) => request.put('/user/info', data),
  
  // 修改密码
  changePassword: (data) => request.post('/user/password', data)
}
```

#### 6.3 请求 Hook 封装
```javascript
// hooks/useRequest.js
import { ref } from 'vue'
import { showToast } from 'vant'

export function useRequest(apiFunc, options = {}) {
  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)
  
  const execute = async (...args) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiFunc(...args)
      data.value = result
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (err) {
      error.value = err
      
      if (options.onError) {
        options.onError(err)
      } else if (options.showError !== false) {
        showToast(err.message || '请求失败')
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    data,
    error,
    execute
  }
}
```

### 7. 移动端适配

#### 7.1 适配方案
- 使用 postcss-pxtorem 将 px 转换为 rem（rootValue 37.5 对应 375 设计稿，750 设计稿请先除以 2）
- 在入口文件引入 amfe-flexible（或自定义 html font-size）设置 rem 基准
- 设计稿基准：375px
- Vant 组件样式也参与 rem 转换，保证自定义样式与组件尺寸缩放一致（如需保留 Vant 原始 px，可再将 `.van-` 加回 `selectorBlackList`）

入口文件开启 rem 适配：
```javascript
// main.js
import 'amfe-flexible'
```

#### 7.2 响应式设计
- 适配不同屏幕尺寸
- 横竖屏适配
- 安全区域适配 (iPhone X 等)

#### 7.3 SCSS 使用示例
在组件中使用 SCSS 变量和混入：
```vue
<template>
  <div class="user-card">
    <div class="user-card__header">
      <h3 class="user-card__title">用户信息</h3>
    </div>
    <div class="user-card__content">
      <p class="user-card__text">这是一段很长的文本内容...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 注意：由于 Vite 配置中已经全局注入了 variables.scss，这里无需再次导入
// 如需导入 mixins，使用 @use 替代 @import
@use '@/assets/styles/mixins.scss' as *;

.user-card {
  padding: $spacing-md;
  background: var(--bg-white);
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-md;
  
  &__header {
    @include flex-between;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid var(--border-color);
  }
  
  &__title {
    font-size: $font-size-lg;
    color: var(--text-primary);
    font-weight: 600;
  }
  
  &__content {
    padding: $spacing-sm 0;
  }
  
  &__text {
    @include ellipsis(2);
    font-size: $font-size-md;
    color: var(--text-regular);
    line-height: 1.5;
  }
  
  // 响应式适配
  @include respond-to('phone') {
    padding: $spacing-sm;
  }
  
  // 安全区域适配
  @include safe-area-inset(padding-bottom, bottom);
}
</style>
```

### 8. 常用功能

#### 8.1 工具函数
- 本地存储封装 (localStorage/sessionStorage)
- Token 管理工具
- 日期格式化
- 数据验证工具
- 防抖/节流函数
- URL 参数处理
- 文件上传/下载
- 主题色管理工具

#### 8.2 自定义指令
完整的自定义指令实现示例：

```javascript
// directives/permission.js
import { useUserStore } from '@/store/modules/user'

/**
 * 权限指令
 * 使用：v-permission="['admin', 'editor']"
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles || []
    
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = roles.some(role => value.includes(role))
      
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限角色，如 v-permission="[\'admin\',\'editor\']"')
    }
  }
}

// directives/debounce.js
/**
 * 防抖指令
 * 使用：v-debounce:500="handleClick"
 */
export const debounce = {
  mounted(el, binding) {
    let timer
    const delay = binding.arg || 300
    
    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer)
      
      timer = setTimeout(() => {
        binding.value()
      }, delay)
    })
  }
}

// directives/throttle.js
/**
 * 节流指令
 * 使用：v-throttle:1000="handleClick"
 */
export const throttle = {
  mounted(el, binding) {
    let timer
    const delay = binding.arg || 1000
    
    el.addEventListener('click', () => {
      if (!timer) {
        timer = setTimeout(() => {
          binding.value()
          timer = null
        }, delay)
      }
    })
  }
}

// directives/index.js
import { permission } from './permission'
import { debounce } from './debounce'
import { throttle } from './throttle'

export default {
  install(app) {
    app.directive('permission', permission)
    app.directive('debounce', debounce)
    app.directive('throttle', throttle)
  }
}
```

#### 8.3 组合式函数 (Hooks)
- usePermission: 权限判断
- useLoading: 加载状态管理
- useRequest: 请求封装
- useCountdown: 倒计时
- useClipboard: 剪贴板操作
- useTheme: 主题切换管理

### 9. 页面示例

#### 9.1 必需页面
- 登录页 (Login)
- 首页 (Home)
- 用户中心 (User)
- 404 页面
- 403 无权限页面

#### 9.2 布局组件
- TabBar 布局（底部导航）
- NavBar 布局（顶部导航）
- 侧边栏布局（可选）

### 10. 性能优化

- 路由懒加载
- 组件懒加载
- 图片懒加载
- Keep-Alive 缓存
- 防抖节流
- 虚拟列表（长列表优化）
- Gzip 压缩
- CDN 加速（可选）

### 11. 开发规范

#### 11.1 代码规范
- ESLint + Prettier 配置
- Git commit 规范 (commitlint)
- 组件命名规范
- 文件命名规范

#### 11.2 注释规范
- 组件注释
- 函数注释
- 复杂逻辑注释

### 12. 环境配置

#### 12.1 环境变量
```
# .env.development
VITE_APP_TITLE=项目名称
VITE_APP_BASE_API=/api
VITE_APP_PORT=3000

# .env.production
VITE_APP_TITLE=项目名称
VITE_APP_BASE_API=https://api.example.com
```

### 13. 依赖包清单

#### 13.1 核心依赖
```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "pinia-plugin-persistedstate": "^3.2.0",
    "vant": "^4.8.0",
    "vue-i18n": "^9.8.0",
    "axios": "^1.6.0",
    "amfe-flexible": "^2.2.1"
  }
}
```

#### 13.2 开发依赖
```json
{
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.0",
    "sass": "^1.69.0",
    "postcss-pxtorem": "^6.0.0",
    "@vant/auto-import-resolver": "^1.0.0",
    "terser": "^5.30.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "unplugin-auto-import": "^0.17.0",
    "unplugin-vue-components": "^0.26.0"
  }
}
```

## 实现细节要求

### 1. 登录流程
1. 用户输入账号密码
2. 调用登录 API
3. 存储 token 和用户信息
4. 获取用户权限
5. 生成动态路由
6. 跳转到首页

### 2. 权限验证流程
1. 路由跳转前检查是否需要登录
2. 检查 token 是否存在
3. 检查用户角色是否有权限访问
4. 无权限跳转到 403 或登录页

### 3. 语言切换流程
1. 用户选择语言
2. 更新 i18n locale
3. 更新 Vant locale
4. 持久化语言设置
5. 刷新当前页面（可选）

### 4. 主题色切换流程
1. 用户选择主题色
2. 更新 App Store 中的 themeColor
3. 动态修改 CSS 变量
4. 更新 Vant 组件主题色
5. 持久化主题色设置
6. 应用到全局样式

## 额外功能（可选）

### 1. 错误处理机制
- [ ] 全局错误捕获和处理
- [ ] API 错误统一处理
- [ ] 页面错误边界组件
- [ ] 错误日志上报

### 2. Mock 数据方案
- [ ] 使用 vite-plugin-mock 配置 Mock 数据
- [ ] 开发环境 Mock 接口
- [ ] Mock 数据管理

### 3. TypeScript 支持
- [ ] TypeScript 配置
- [ ] 类型定义文件
- [ ] API 接口类型定义
- [ ] Store 类型定义

### 4. 进阶功能
- [ ] 主题切换（深色/浅色模式）✅ 已包含
- [ ] 消息推送
- [ ] 扫码功能
- [ ] 地图集成
- [ ] 图表集成 (ECharts)
- [ ] 文件上传/预览
- [ ] 分享功能
- [ ] 埋点统计
- [ ] 骨架屏
- [ ] 下拉刷新/上拉加载
- [ ] 虚拟滚动列表
- [ ] 水印功能
- [ ] 二维码生成

### 5. Mock 数据配置示例
```javascript
// vite.config.js
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    viteMockServe({
      mockPath: 'mock',
      enable: true,
    })
  ]
})

// mock/user.js
export default [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }) => {
      return {
        code: 200,
        data: {
          token: 'mock-token-123456',
          userInfo: {
            id: 1,
            username: body.username,
            role: 'admin'
          }
        },
        message: '登录成功'
      }
    }
  }
]
```

### 6. 全局错误处理
```javascript
// main.js
import { showToast } from 'vant'

app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误：', err)
  console.error('错误信息：', info)
  
  // 上报错误日志
  // reportError(err, info)
  
  showToast('系统错误，请稍后重试')
}

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', event => {
  console.error('未捕获的 Promise 错误：', event.reason)
  event.preventDefault()
})
```

## 输出要求

1. 完整的项目代码结构
2. 详细的代码注释
3. README.md 使用说明
4. 关键功能的实现说明
5. 可直接运行的完整项目

## 注意事项

1. 代码要符合 Vue 3 Composition API 最佳实践
2. 使用 `<script setup>` 语法
3. 合理使用 TypeScript（可选）
4. 注重代码可维护性和可扩展性
5. 移动端交互体验优化
6. 性能优化考虑
7. 安全性考虑（XSS、CSRF 防护）
8. 错误边界处理
9. 加载状态和骨架屏
10. 网络异常处理

---

**使用此 Prompt 时，可以根据具体项目需求调整和补充相关内容。**

---
