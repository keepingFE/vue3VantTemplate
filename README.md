# Vue3 移动端项目模板

基于 Vue 3 + Vite + Vant 4 的移动端项目模板，开箱即用。

## ✨ 特性

- 🚀 **Vue 3** - 使用 Composition API
- ⚡️ **Vite** - 极速的开发体验
- 📱 **Vant 4** - 轻量、可靠的移动端组件库
- 🎨 **主题定制** - 支持主题色切换和深色模式
- 🌍 **国际化** - 内置中英文支持
- 🔐 **权限管理** - 完整的路由权限控制
- 📦 **状态管理** - Pinia + 持久化
- 🎯 **TypeScript** - 类型定义支持
- 📐 **移动端适配** - postcss-pxtorem + amfe-flexible
- 🔧 **自动导入** - API 和组件自动导入

## 📦 技术栈

- **框架**: Vue 3.3+
- **构建工具**: Vite 5.0+
- **UI 组件库**: Vant 4.8+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **国际化**: Vue I18n 9.8+
- **HTTP 客户端**: Axios 1.6+
- **CSS 预处理器**: SCSS
- **移动端适配**: amfe-flexible + postcss-pxtorem

## 📁 项目结构

```
vue3VantTemplate/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── modules/       # 接口模块
│   │   └── request.js     # Axios 封装
│   ├── assets/            # 资源文件
│   │   ├── images/        # 图片
│   │   ├── icons/         # 图标
│   │   └── styles/        # 全局样式
│   │       ├── variables.scss  # SCSS 变量
│   │       ├── mixins.scss     # SCSS 混入
│   │       ├── common.scss     # 通用样式
│   │       ├── vant-override.scss # Vant 样式覆盖
│   │       └── index.scss      # 样式入口
│   ├── components/        # 公共组件
│   │   ├── common/        # 通用组件
│   │   └── business/      # 业务组件
│   ├── config/            # 配置文件
│   ├── constants/         # 常量定义
│   │   ├── index.js       # 通用常量
│   │   └── theme.js       # 主题常量
│   ├── directives/        # 自定义指令
│   │   ├── permission.js  # 权限指令
│   │   ├── debounce.js    # 防抖指令
│   │   ├── throttle.js    # 节流指令
│   │   └── index.js       # 指令入口
│   ├── hooks/             # 组合式函数
│   │   ├── useTheme.js    # 主题管理
│   │   ├── useRequest.js  # 请求封装
│   │   └── usePermission.js # 权限判断
│   ├── locales/           # 国际化
│   │   ├── zh-CN.js       # 中文语言包
│   │   ├── en-US.js       # 英文语言包
│   │   └── index.js       # i18n 配置
│   ├── router/            # 路由配置
│   │   ├── routes.js      # 路由定义
│   │   ├── guards.js      # 路由守卫
│   │   └── index.js       # 路由入口
│   ├── store/             # Pinia 状态管理
│   │   ├── modules/       # Store 模块
│   │   │   ├── user.js    # 用户模块
│   │   │   ├── app.js     # 应用模块
│   │   │   └── permission.js # 权限模块
│   │   └── index.js       # Store 入口
│   ├── utils/             # 工具函数
│   │   ├── auth.js        # 认证工具
│   │   ├── storage.js     # 本地存储
│   │   ├── theme.js       # 主题管理
│   │   ├── tools.js       # 工具函数
│   │   ├── validate.js    # 表单验证
│   │   └── permission.js  # 权限判断
│   ├── views/             # 页面视图
│   │   ├── home/          # 首页
│   │   ├── user/          # 用户中心
│   │   ├── login/         # 登录页
│   │   ├── admin/         # 管理页
│   │   └── error/         # 错误页面
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── vite.config.js         # Vite 配置
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🔧 核心功能

### 1. 路由权限管理

- ✅ 基于角色的权限控制 (RBAC)
- ✅ 路由级权限控制（路由守卫）
- ✅ 按钮级权限控制（v-permission 指令）
- ✅ 动态路由生成
- ✅ 路由懒加载

### 2. 状态管理

- ✅ Pinia 状态管理
- ✅ 状态持久化（pinia-plugin-persistedstate）
- ✅ 模块化 Store（user、app、permission）

### 3. 国际化

- ✅ Vue I18n 9.x
- ✅ 中英文语言包
- ✅ 语言切换功能
- ✅ Vant 组件库语言同步

### 4. 主题定制

- ✅ 动态主题色切换
- ✅ 深色/浅色模式
- ✅ 跟随系统主题
- ✅ CSS 变量管理
- ✅ Vant 组件主题同步
- ✅ 主题持久化

### 5. API 请求

- ✅ Axios 封装
- ✅ 请求/响应拦截器
- ✅ 统一错误处理
- ✅ Loading 状态管理
- ✅ Token 自动注入
- ✅ API 模块化管理

### 6. 移动端适配

- ✅ postcss-pxtorem（px 转 rem）
- ✅ amfe-flexible（动态设置 rem 基准）
- ✅ 375px 设计稿基准
- ✅ 安全区域适配
- ✅ 横竖屏适配

### 7. 工具函数

- ✅ 本地存储封装
- ✅ Token 管理
- ✅ 表单验证
- ✅ 防抖/节流
- ✅ 权限判断

### 8. 自定义指令

- ✅ v-permission - 权限控制
- ✅ v-debounce - 防抖
- ✅ v-throttle - 节流

### 9. 组合式函数 (Hooks)

- ✅ useTheme - 主题管理
- ✅ useRequest - 请求封装
- ✅ usePermission - 权限判断

## 📝 使用说明

### 主题切换

```vue
<script setup>
import { useTheme } from '@/hooks/useTheme'

const { changeThemeColor, changeThemeMode } = useTheme()

// 切换主题色
changeThemeColor('blue') // blue, green, purple, orange, red

// 切换主题模式
changeThemeMode('dark') // light, dark, auto
</script>
```

### 语言切换

```vue
<script setup>
import { setLocale } from '@/locales'

// 切换语言
setLocale('zh-CN') // zh-CN, en-US
</script>
```

### 权限控制

```vue
<template>
  <!-- 按钮级权限控制 -->
  <van-button v-permission="['admin']">管理员可见</van-button>
</template>

<script setup>
import { usePermission } from '@/hooks/usePermission'

const { hasPermission } = usePermission()

// 代码中判断权限
if (hasPermission(['admin'])) {
  // 执行操作
}
</script>
```

### API 请求

```javascript
// api/modules/user.js
import request from '../request'

export const userApi = {
  login: (data) => request.post('/user/login', data),
  getUserInfo: () => request.get('/user/info')
}

// 在组件中使用
import { userApi } from '@/api/modules/user'
import { useRequest } from '@/hooks/useRequest'

const { loading, execute } = useRequest(userApi.login)

const handleLogin = async () => {
  const result = await execute({ username, password })
}
```

## 🎨 样式定制

### 使用 SCSS 变量

```vue
<style lang="scss" scoped>
.my-component {
  padding: $spacing-md;
  font-size: $font-size-lg;
  border-radius: $border-radius-md;
  color: var(--text-primary);
  background-color: var(--bg-white);
}
</style>
```

### 使用 SCSS 混入

```vue
<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;

.my-text {
  @include ellipsis(2); // 两行省略
}

.my-container {
  @include flex-center; // 居中布局
}
</style>
```

### 覆盖 Vant 组件样式

```vue
<style lang="scss" scoped>
.my-page {
  :deep(.van-button--primary) {
    background-color: var(--theme-color);
    border-radius: 20px;
  }
}
</style>
```

## 📱 页面示例

- **登录页** (`/login`) - 用户登录
- **首页** (`/home`) - 应用首页
- **用户中心** (`/user`) - 个人信息、设置
- **管理页** (`/admin`) - 管理功能（需要 admin 权限）
- **404 页面** - 页面不存在
- **403 页面** - 无权限访问

## 🔐 环境变量

### 开发环境 (.env.development)

```
VITE_APP_TITLE=移动端应用
VITE_APP_BASE_API=/api
VITE_APP_PORT=3000
```

### 生产环境 (.env.production)

```
VITE_APP_TITLE=移动端应用
VITE_APP_BASE_API=https://api.example.com
```

## 📄 License

MIT License
