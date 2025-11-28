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
          requiresAuth: true,
          keepAlive: true,
          icon: 'home-o'
        }
      },
      {
        path: '/list',
        name: 'List',
        component: () => import('@/views/list/index.vue'),
        meta: {
          title: '列表',
          requiresAuth: false,
          keepAlive: true,
          icon: 'bars'
        }
      },
      {
        path: '/message',
        name: 'Message',
        component: () => import('@/views/message/index.vue'),
        meta: {
          title: '消息',
          requiresAuth: false,
          keepAlive: true,
          icon: 'chat-o'
        }
      },
      {
        path: '/chart',
        name: 'Chart',
        component: () => import('@/views/chart/index.vue'),
        meta: {
          title: '图表',
          requiresAuth: false,
          keepAlive: true,
          icon: 'chart-trending-o'
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
    path: '/list/detail/:id',
    name: 'ListDetail',
    component: () => import('@/views/list/detail.vue'),
    meta: {
      title: '列表详情',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/message/detail/:id',
    name: 'MessageDetail',
    component: () => import('@/views/message/detail.vue'),
    meta: {
      title: '消息详情',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/profile.vue'),
    meta: {
      title: '个人信息',
      requiresAuth: true,
      hidden: true
    }
  },
  {
    path: '/user/pdf-demo',
    name: 'PdfDemo',
    component: () => import('@/views/user/pdf-demo.vue'),
    meta: {
      title: 'PDF预览',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/ai-chat',
    name: 'AiChat',
    component: () => import('@/views/ai-chat/index.vue'),
    meta: {
      title: 'AI 助手',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/markdown',
    name: 'MarkdownDemo',
    component: () => import('@/views/markdown/index.vue'),
    meta: {
      title: 'Markdown 演示',
      requiresAuth: false,
      hidden: true
    }
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
