# 路由权限配置指南

## 概述

优化后的路由守卫支持三种路由类型，权限控制更加清晰和安全。

## 三种路由类型

### 1. 公开路由（不需要登录）

**适用场景**：登录页、404页面、帮助页面等任何人都可以访问的页面

**配置方式**：
```javascript
{
  path: '/help',
  name: 'Help',
  component: () => import('@/views/help/index.vue'),
  meta: {
    title: '帮助中心',
    requiresAuth: false  // 明确标记不需要登录
  }
}
```

**特点**：
- 必须明确设置 `requiresAuth: false`
- 无需登录即可访问
- 不检查用户角色

### 2. 登录路由（需要登录，不需要特定角色）

**适用场景**：个人中心、设置页面等所有登录用户都可以访问的页面

**配置方式**：
```javascript
{
  path: '/user',
  name: 'User',
  component: () => import('@/views/user/index.vue'),
  meta: {
    title: '我的',
    requiresAuth: true,  // 需要登录
    // 不设置 roles，表示所有登录用户都可以访问
    keepAlive: true,
    icon: 'user-o'
  }
}
```

**特点**：
- 设置 `requiresAuth: true` 或不设置（默认需要登录）
- 不设置 `roles` 字段
- 只要登录就可以访问
- 不检查特定角色

### 3. 角色路由（需要登录且需要特定角色）

**适用场景**：管理后台、VIP功能等需要特定权限的页面

**配置方式**：
```javascript
{
  path: '/admin',
  name: 'Admin',
  component: () => import('@/views/admin/index.vue'),
  meta: {
    title: '管理后台',
    requiresAuth: true,  // 需要登录（可省略，有roles时默认需要登录）
    roles: ['admin', 'super-admin'],  // 需要 admin 或 super-admin 角色
    icon: 'setting-o'
  }
}
```

**特点**：
- 设置 `roles` 数组，指定允许访问的角色
- 用户必须拥有 `roles` 中的至少一个角色才能访问
- 自动要求登录（即使不设置 `requiresAuth: true`）

## 权限检查流程

路由守卫按以下顺序检查权限：

```
1. 检查是否在白名单中（/login, /404, /403）
   └─ 是 → 直接放行
   └─ 否 → 继续

2. 检查路由是否需要登录
   └─ 不需要 → 直接放行
   └─ 需要 → 继续

3. 检查用户是否已登录
   └─ 未登录 → 重定向到登录页
   └─ 已登录 → 继续

4. 检查是否已获取用户信息
   └─ 未获取 → 获取用户信息 + 生成动态路由
   └─ 已获取 → 继续

5. 检查路由是否需要特定角色
   └─ 不需要 → 直接放行
   └─ 需要 → 检查用户角色是否匹配
      └─ 匹配 → 放行
      └─ 不匹配 → 跳转到 403 页面
```

## 配置示例

### 示例1：混合配置

```javascript
export const constantRoutes = [
  // 公开路由：不需要登录
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: {
      title: '关于我们',
      requiresAuth: false
    }
  },
  
  // 登录路由：需要登录，所有用户都可以访问
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true
    }
  },
  
  // 角色路由：需要登录，只有管理员可以访问
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/users.vue'),
    meta: {
      title: '用户管理',
      roles: ['admin']
    }
  },
  
  // 角色路由：需要登录，管理员或编辑可以访问
  {
    path: '/content/edit',
    name: 'ContentEdit',
    component: () => import('@/views/content/edit.vue'),
    meta: {
      title: '内容编辑',
      roles: ['admin', 'editor']
    }
  }
]
```

### 示例2：嵌套路由

```javascript
{
  path: '/dashboard',
  component: Layout,
  meta: {
    requiresAuth: true  // 父路由需要登录
  },
  children: [
    {
      path: 'overview',
      name: 'DashboardOverview',
      component: () => import('@/views/dashboard/overview.vue'),
      meta: {
        title: '概览',
        // 继承父路由的 requiresAuth，所有登录用户都可以访问
      }
    },
    {
      path: 'analytics',
      name: 'DashboardAnalytics',
      component: () => import('@/views/dashboard/analytics.vue'),
      meta: {
        title: '数据分析',
        roles: ['admin', 'analyst']  // 只有管理员和分析师可以访问
      }
    }
  ]
}
```

## 最佳实践

### 1. 安全优先原则

- **默认需要登录**：如果不确定是否需要登录，默认设置为需要登录
- **明确标记公开路由**：对于不需要登录的路由，必须明确设置 `requiresAuth: false`
- **最小权限原则**：只给用户必要的角色权限

### 2. 角色设计建议

```javascript
// 推荐的角色设计
const ROLES = {
  SUPER_ADMIN: 'super-admin',  // 超级管理员：所有权限
  ADMIN: 'admin',              // 管理员：大部分管理权限
  EDITOR: 'editor',            // 编辑：内容管理权限
  USER: 'user',                // 普通用户：基础权限
  GUEST: 'guest'               // 访客：最小权限
}
```

### 3. 路由组织建议

```javascript
// 按权限级别组织路由
export const constantRoutes = [
  // 公开路由
  ...publicRoutes,
  
  // 需要登录的基础路由
  ...authRoutes,
  
  // 错误页面
  ...errorRoutes
]

export const asyncRoutes = [
  // 管理员路由
  ...adminRoutes,
  
  // 编辑路由
  ...editorRoutes,
  
  // VIP路由
  ...vipRoutes
]
```

## 常见问题

### Q1: 如果不设置 `requiresAuth`，默认行为是什么？

**A**: 默认需要登录（安全优先）。如果路由不需要登录，必须明确设置 `requiresAuth: false`。

### Q2: 如果设置了 `roles`，还需要设置 `requiresAuth: true` 吗？

**A**: 不需要。设置了 `roles` 会自动要求登录。但为了代码可读性，建议明确设置。

### Q3: 如何实现"登录后可见，未登录隐藏"的功能？

**A**: 
```javascript
{
  path: '/vip',
  meta: {
    requiresAuth: true,  // 需要登录
    hidden: false        // 在菜单中显示
  }
}
```

在菜单组件中：
```javascript
const visibleMenus = menus.filter(menu => {
  if (menu.meta?.hidden) return false
  if (menu.meta?.requiresAuth && !isLoggedIn) return false
  return true
})
```

### Q4: 如何处理角色动态变化？

**A**: 当用户角色变化时，需要：
1. 更新用户信息
2. 重新生成动态路由
3. 刷新页面或重定向

```javascript
// 在用户角色变化后
await userStore.getUserInfo()
await permissionStore.generateRoutes(userStore.roles)
router.replace(router.currentRoute.value.fullPath)
```

## 辅助函数说明

### `requiresAuth(route)`
检查路由是否需要登录

**逻辑**：
1. 如果明确设置了 `requiresAuth`，以此为准
2. 如果设置了 `roles`，默认需要登录
3. 否则默认需要登录（安全优先）

### `requiresRoles(route)`
检查路由是否需要特定角色

**逻辑**：
- 检查 `meta.roles` 是否存在且不为空

### `hasPermission(userRoles, routeRoles)`
检查用户是否有权限访问路由

**逻辑**：
1. 如果路由不需要角色，返回 `true`
2. 如果用户没有角色，返回 `false`
3. 检查用户角色是否包含路由所需的任一角色

## 迁移指南

如果你正在从旧版本迁移，请注意：

### 旧版本（不推荐）
```javascript
{
  path: '/home',
  meta: {
    // 不明确，容易出错
  }
}
```

### 新版本（推荐）
```javascript
{
  path: '/home',
  meta: {
    requiresAuth: false  // 明确标记
  }
}
```

## 总结

优化后的路由守卫系统具有以下优势：

✅ **清晰的权限模型**：三种路由类型，职责明确  
✅ **安全优先**：默认需要登录，避免权限泄露  
✅ **易于维护**：辅助函数封装，逻辑清晰  
✅ **灵活配置**：支持多种权限组合  
✅ **完善的错误处理**：登录过期、无权限等场景都有处理
