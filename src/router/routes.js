/**
 * 路由配置
 */

/**
 * 基础路由（不需要权限）
 */
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/common/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          requiresAuth: false,
          keepAlive: true,
          icon: 'home-o'
        }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: {
          title: '我的',
          requiresAuth: true,
          keepAlive: true,
          icon: 'user-o'
        }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true
    }
  }
]

/**
 * 动态路由（需要根据权限动态添加）
 */
export const asyncRoutes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/index.vue'),
    meta: {
      title: '管理',
      requiresAuth: true,
      roles: ['admin'],
      icon: 'setting-o'
    }
  }
]

