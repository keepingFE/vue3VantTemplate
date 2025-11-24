# 快速开始指南

## 📦 安装依赖

```bash
npm install
```

或使用其他包管理器：

```bash
# yarn
yarn install

# pnpm
pnpm install
```

## 🚀 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

## 🎯 快速体验

### 1. 登录功能

访问 http://localhost:3000/login

- 输入任意用户名和密码即可登录（当前使用 Mock 数据）
- 登录后会跳转到首页

### 2. 主题切换

在用户中心页面（/user）可以：
- 切换主题色（蓝、绿、紫、橙、红）
- 切换主题模式（浅色、深色、跟随系统）

### 3. 语言切换

在用户中心页面（/user）可以：
- 切换语言（中文、英文）
- Vant 组件库语言会同步切换

### 4. 权限控制

- 访问 /admin 需要 admin 权限
- 可以在代码中修改用户角色测试权限功能

## 🔧 开发建议

### 1. 修改 API 地址

编辑 `.env.development` 文件：

```env
VITE_APP_BASE_API=/api  # 修改为你的 API 地址
```

### 2. 配置代理

编辑 `vite.config.js` 中的 proxy 配置：

```javascript
proxy: {
  '/api': {
    target: 'http://your-api-server.com',  // 修改为你的后端地址
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### 3. 添加新页面

1. 在 `src/views` 下创建页面组件
2. 在 `src/router/routes.js` 中添加路由配置
3. 如需权限控制，在 meta 中添加 `requiresAuth` 和 `roles`

示例：

```javascript
{
  path: '/example',
  name: 'Example',
  component: () => import('@/views/example/index.vue'),
  meta: {
    title: '示例页面',
    requiresAuth: true,
    roles: ['admin', 'user'],
    keepAlive: true
  }
}
```

### 4. 添加新的 API 接口

1. 在 `src/api/modules` 下创建模块文件
2. 使用 request 实例发起请求

示例：

```javascript
// src/api/modules/product.js
import request from '../request'

export const productApi = {
  getList: (params) => request.get('/product/list', { params }),
  getDetail: (id) => request.get(`/product/${id}`),
  create: (data) => request.post('/product', data),
  update: (id, data) => request.put(`/product/${id}`, data),
  delete: (id) => request.delete(`/product/${id}`)
}
```

### 5. 使用 Hooks

```vue
<script setup>
import { useTheme } from '@/hooks/useTheme'
import { useRequest } from '@/hooks/useRequest'
import { usePermission } from '@/hooks/usePermission'

// 主题管理
const { changeThemeColor, changeThemeMode } = useTheme()

// 请求管理
const { loading, execute } = useRequest(apiFunc)

// 权限判断
const { hasPermission } = usePermission()
</script>
```

## 📱 移动端调试

### 1. 使用浏览器开发者工具

1. 打开 Chrome DevTools (F12)
2. 点击设备工具栏图标（Ctrl+Shift+M）
3. 选择移动设备型号

### 2. 真机调试

1. 确保手机和电脑在同一局域网
2. 查看电脑 IP 地址
3. 在手机浏览器访问 `http://你的IP:3000`

### 3. 使用 vconsole 调试

安装 vconsole：

```bash
npm install vconsole
```

在 `main.js` 中引入：

```javascript
import VConsole from 'vconsole'

if (import.meta.env.DEV) {
  new VConsole()
}
```

## 🎨 样式开发

### 1. 使用 SCSS 变量

```vue
<style lang="scss" scoped>
.my-component {
  padding: $spacing-md;
  font-size: $font-size-lg;
  border-radius: $border-radius-md;
}
</style>
```

### 2. 使用 CSS 变量

```vue
<style lang="scss" scoped>
.my-component {
  color: var(--text-primary);
  background-color: var(--bg-white);
  border-color: var(--border-color);
}
</style>
```

### 3. 使用 SCSS 混入

```vue
<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;

.my-text {
  @include ellipsis(2);  // 两行省略
}

.my-container {
  @include flex-center;  // 居中布局
}
</style>
```

### 4. 覆盖 Vant 组件样式

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

## 🔐 权限开发

### 1. 路由权限

在路由配置中添加 `meta.roles`：

```javascript
{
  path: '/admin',
  meta: {
    requiresAuth: true,
    roles: ['admin']  // 只有 admin 角色可以访问
  }
}
```

### 2. 按钮权限

使用 `v-permission` 指令：

```vue
<template>
  <van-button v-permission="['admin']">管理员可见</van-button>
  <van-button v-permission="['admin', 'editor']">管理员和编辑可见</van-button>
</template>
```

### 3. 代码中判断权限

```vue
<script setup>
import { usePermission } from '@/hooks/usePermission'

const { hasPermission } = usePermission()

if (hasPermission(['admin'])) {
  // 执行需要权限的操作
}
</script>
```

## 🌍 国际化开发

### 1. 添加新的语言包

在 `src/locales` 下创建新的语言文件，如 `ja-JP.js`：

```javascript
export default {
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    // ...
  }
}
```

在 `src/locales/index.js` 中导入：

```javascript
import jaJP from './ja-JP'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
}
```

### 2. 在组件中使用

```vue
<template>
  <div>{{ $t('common.confirm') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

console.log(t('common.confirm'))
</script>
```

## 📦 构建部署

### 1. 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录

### 2. 预览生产构建

```bash
npm run preview
```

### 3. 部署到服务器

将 `dist` 目录上传到服务器即可

### 4. Nginx 配置示例

```nginx
server {
  listen 80;
  server_name your-domain.com;
  
  location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://your-api-server;
  }
}
```

## 🐛 常见问题

### 1. 端口被占用

修改 `vite.config.js` 中的端口：

```javascript
server: {
  port: 3001  // 修改为其他端口
}
```

### 2. 样式不生效

检查是否正确引入了全局样式：

```javascript
// main.js
import '@/assets/styles/index.scss'
```

### 3. 路由跳转后页面空白

检查路由配置和组件路径是否正确

### 4. API 请求失败

1. 检查 `.env.development` 中的 API 地址
2. 检查 `vite.config.js` 中的代理配置
3. 检查浏览器控制台的网络请求

## 📚 更多资源

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Vant 4 文档](https://vant-ui.github.io/vant/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Vue I18n 文档](https://vue-i18n.intlify.dev/)

## 🎉 开始开发

现在你可以开始开发你的移动端应用了！祝你开发愉快！

