# 权限管理使用文档

本文档介绍 `vue3VantTemplate` 权限管理模块的整体能力、目录结构以及常见使用方式，帮助你在移动端项目中快速落地路由级与按钮级权限控制。

---

## 1. 模块概览

| 能力 | 说明 |
| --- | --- |
| 认证状态 | `src/store/modules/user.js` 使用 Pinia 维护 `token`、`userInfo`、`roles`，并与 `utils/auth.js` 协同持久化 |
| 路由守卫 | `src/router/guards.js` 负责登录拦截、角色校验、动态路由注册以及白名单处理 |
| 动态路由 | `src/router/routes.js` 将需要权限的页面放入 `asyncRoutes`，由 `permissionStore.generateRoutes` 在运行时注入 |
| 权限 Store | `src/store/modules/permission.js` 封装角色判定、路由过滤、权限列表存储 |
| 组合式 Hook | `src/hooks/usePermission.js` 提供响应式的 `hasPermission`、`hasAllPermissions`、`isAdmin` 等方法 |
| 自定义指令 | `src/directives/permission.js` 提供 `v-permission`，实现按钮级别的显示/隐藏控制 |
| 工具函数 | `src/utils/permission.js` 提供非响应式的权限判断，适合在工具模块或路由外部场景复用 |
| Mock/接口 | `mock/user.js` 给出 `admin`、`user` 等角色示例，`src/api/modules/user.js` 定义登录、获取用户信息、登出等接口 |

---

## 2. 权限数据结构与角色约定

- `roles`: 数组类型，描述用户当前拥有的角色，例如 `['admin']`、`['user']`。系统内置可识别的角色包括 `admin`、`user`、`guest`、`editor`、`viewer`（参见 `useUserStore.getUserInfo`）。
- `permissions`: 保留字段，用于承载按钮/资源级权限标识（Mock 中示例为 `'*:*:*'`、`'user:read'`）。
- `token`: 登录后由 `/user/login` 返回，`utils/auth.js` 负责保存、过期检测与刷新。

> Mock 账号（默认 `VITE_USE_MOCK=true` 时可用）：
>
> - 管理员：`admin` / `123456`（角色：`admin`，权限：`*:*:*`）
> - 普通用户：`user` / `123456`（角色：`user`，权限：`user:read`）

---

## 3. 权限工作流

1. **登录**：调用 `userApi.login`，Pinia 持久化 `token` 与初始用户信息。
2. **路由拦截**：在 `router.beforeEach` 中读取白名单 (`/login`、`/403`、`/404`)，判断是否需要登录（`meta.requiresAuth` 与 `meta.roles`）。
3. **获取用户信息**：若尚未加载 `userInfo`，执行 `userStore.getUserInfo`，并校验返回的角色。
4. **动态路由注入**：调用 `permissionStore.generateRoutes(roles)`，对 `asyncRoutes` 进行过滤或直接放行（`admin` 拥有全部权限），随后使用 `router.addRoute` 注入。
5. **页面层权限**：访问受限页面时由路由守卫校验 `meta.roles`，未匹配则跳转 `/403` 并展示提示。
6. **组件/指令级权限**：在模板中使用 `v-permission` 或在脚本中使用 `usePermission` / `utils/permission` 完成交互控制。
7. **退出/状态恢复**：`userStore.logout` 会清除 `token`、重置角色，并调用 `permissionStore.resetRoutes` 清空动态路由。

流程示意：

```
登录 → 保存 token → beforeEach 拦截 → 拉取用户信息 → 生成可访问路由 → 
页面加载 → 组件中调用 Hook/指令 → 根据角色显示/隐藏具体功能
```

---

## 4. 路由权限配置

### 4.1 路由分类

参见 `src/router/routes.js`：

- `constantRoutes`：无需权限的基础路由，如 `/home`、`/list`、错误页等。若页面完全公开，请显式设置 `meta.requiresAuth = false`。
- `asyncRoutes`：需根据 `roles` 动态注入的路由，例如 `/admin`（`roles: ['admin']`）。可根据业务拆分多个模块文件再聚合。

### 4.2 `meta` 字段约定

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题及 Tab 文案 |
| `requiresAuth` | 是否要求登录；若未设置且无 `roles`，路由守卫默认视为需要登录 |
| `roles` | 允许访问的角色数组，满足任意一个即可 |
| `icon` / `keepAlive` / `hidden` | 其他 UI 行为控制（与权限逻辑无直接关系） |

### 4.3 动态路由过滤

`usePermissionStore.filterAsyncRoutes(routes, roles)` 会：

1. 复制路由配置，避免原始定义被修改。
2. 递归处理子路由。
3. 若 `route.meta.roles` 存在，则校验 `roles` 是否包含其中任一项。
4. 返回通过校验的路由数组，供 `router.addRoute` 注册。

> 详细的路由权限分类说明可参考 `docs/route-permission-guide.md`。

---

## 5. 按钮级/指令级权限

### 5.1 `v-permission` 指令

文件：`src/directives/permission.js`

- 写法：`<van-button v-permission="['admin', 'editor']">仅管理员/编辑可见</van-button>`
- 支持传入单个字符串或字符串数组。
- 在 `mounted` 与 `updated` 钩子中会读取当前用户角色，若不满足则设置 `display: none` 并记录 `data-required-roles`。
- 全局注册于 `src/directives/index.js`，在 `main.js` 中通过 `app.use(directives)` 生效。

使用建议：

1. 仅在需要完全隐藏元素的场景使用；若需降级提示可结合 `usePermission` 自行控制。
2. 避免与 `v-if` 混用造成重复判断，优先选择一个入口维护。
3. 若权限参数来源动态变量，确保其为数组或字符串，以触发 `updated` 重新校验。

### 5.2 组合式 Hook

文件：`src/hooks/usePermission.js`

常用方法：

```vue
<script setup>
import { usePermission } from '@/hooks/usePermission'

const { hasPermission, hasAllPermissions, hasRole, isAdmin } = usePermission()

const canEdit = computed(() => hasPermission(['admin', 'editor']))
const canSeeSensitive = computed(() => hasAllPermissions(['admin', 'auditor']))
</script>
```

- Hook 会返回响应式的 `roles`、`isLoggedIn`，可用于模板渲染或业务逻辑分支。
- `isGuest`、`isUser`、`isAdmin` 以 `computed` 暴露，便于快速判断常见角色。

### 5.3 工具函数

文件：`src/utils/permission.js`

适用于非组件上下文（如工具库、指令内部）：

```javascript
import { hasPermission, hasAllPermissions, hasRole, isAdmin } from '@/utils/permission'

if (hasPermission(['finance'])) {
  // ...执行导出报表
}
```

注意：工具函数非响应式，若角色在运行期发生变化需要自行重新调用。

---

## 6. Store 能力一览

### 6.1 `useUserStore`

- `state`: `token`、`userInfo`、`roles`
- 关键方法：
  - `login(credentials)`：调用后端接口保存 token 与用户信息。
  - `getUserInfo()`：请求 `/user/info` 并校验角色合法性，若无合法角色自动降级为 `guest`。
  - `logout()`：调用 `/user/logout`、清理 `token`、重置权限路由。
  - `resetToken()`：在 token 失效或获取用户信息失败时调用。
- 持久化：通过 `pinia-plugin-persistedstate` 持久化 `token`（键名 `user-store`）。

### 6.2 `usePermissionStore`

- `state`: `routes`、`addRoutes`、`permissions`
- 关键方法：
  - `generateRoutes(roles)`：管理员放行所有 `asyncRoutes`，普通角色通过 `filterAsyncRoutes` 过滤。
  - `setPermissions(list)`：可扩展为按钮/资源权限列表缓存。
  - `resetRoutes()`：登出或切换账号时清空动态注入的路由。

---

## 7. 接口与 Mock 联调

### 7.1 接口定义

文件：`src/api/modules/user.js`

```javascript
export const userApi = {
  login: (data) => request.post('/user/login', data),
  getUserInfo: () => request.get('/user/info'),
  logout: () => request.post('/user/logout'),
  updateUserInfo: (data) => request.put('/user/info', data),
  changePassword: (data) => request.post('/user/password', data)
}
```

### 7.2 Mock 数据

文件：`mock/user.js`

- 提供 `admin`、`user` 两种账号，返回 `roles`、`permissions` 示例。
- `/api/user/info` 接口会根据 `Authorization` 请求头解析用户 ID 并返回对应角色。
- 若要扩展角色，可直接修改 `users` 数组或对接真实后端。

---

## 8. 常见场景操作指南

### 8.1 新增角色并授予路由

1. 在后端或 Mock 中为角色返回 `roles` 字段。
2. 在 `useUserStore.getUserInfo` 的 `validRoles` 列表中添加角色名。
3. 在 `asyncRoutes` 中为需要控制的页面设置 `meta.roles`，示例：

```javascript
{
  path: '/vip',
  name: 'VipCenter',
  component: () => import('@/views/vip/index.vue'),
  meta: {
    title: 'VIP 特权',
    roles: ['vip', 'admin'],
    requiresAuth: true
  }
}
```

4. 重新登录或调用 `userStore.getUserInfo()` + `permissionStore.generateRoutes()` 让新权限生效。

### 8.2 控制列表操作按钮

```vue
<template>
  <van-button
    type="primary"
    v-permission="['admin', 'editor']"
    @click="handleApprove"
  >
    审核通过
  </van-button>

  <van-button
    type="danger"
    v-if="hasPermission('admin')"
    @click="handleDelete"
  >
    删除
  </van-button>
</template>

<script setup>
import { usePermission } from '@/hooks/usePermission'

const { hasPermission } = usePermission()
</script>
```

### 8.3 菜单/Tab 渲染

```javascript
const menus = computed(() => {
  const { roles } = usePermission()
  return allMenus.filter(menu => {
    if (menu.meta?.hidden) return false
    if (menu.meta?.roles?.length) {
      return menu.meta.roles.some(role => roles.value.includes(role))
    }
    if (menu.meta?.requiresAuth === false) return true
    return userStore.isLoggedIn
  })
})
```

### 8.4 Token 过期与自动跳转

`router/guards.js` 中一旦检测到 `userStore.getUserInfo` 抛错，会调用 `userStore.resetToken()` 并重定向到登录页，同时展示 `showToast('登录已过期，请重新登录')`。

---

## 9. 调试与排错

| 现象 | 排查步骤 |
| --- | --- |
| 登录成功但无菜单 | 检查接口返回的 `roles` 是否在 `validRoles` 白名单内；确认 `asyncRoutes` 是否正确配置 `meta.roles` |
| 指令不生效 | 确认是否在入口注册 `app.use(directives)`；确保模板参数是字符串或数组 |
| 登录后仍跳转登录页 | 检查 `requiresAuth` 配置及 `WHITE_LIST`；确认 `token` 是否存在且未过期，可在控制台确认 `localStorage` 中的 `app-token` |
| 切换账号仍看到旧路由 | 是否在登出时调用了 `permissionStore.resetRoutes()`；如切换账号后直接刷新页面，可清空浏览器缓存 |
| Mock 无法区分账号 | Mock 根据 `Authorization` 头中的 token（`mock-token-<id>-<timestamp>`）解析用户 ID，确保请求带上 `Bearer token` |

---

## 10. 最佳实践

1. **显式配置**：公开页面务必设置 `requiresAuth: false`，避免默认要求登录。
2. **最小权限原则**：在后端与前端同时遵守，尽量只赋予用户所需角色。
3. **统一角色常量**：可在 `src/constants/index.js` 或新建文件维护角色常量，避免魔法字符串。
4. **按钮权限共用逻辑**：若多个组件共用相同的权限判断，可封装成 `computed` 或独立 Hook 提升可维护性。
5. **联动日志**：在 `router.onError`、`userStore.getUserInfo` 捕获到异常时已 `console.error`，可结合监控上报定位问题。

---

通过以上能力，你可以快速完成登录态判断、路由守卫、动态路由注入以及按钮级权限控制。如果需要更细粒度的路由配置示例，请配合 `docs/route-permission-guide.md` 一起阅读。欢迎根据业务实际情况扩展角色体系或自定义权限指令。
