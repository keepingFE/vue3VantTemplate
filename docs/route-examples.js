/**
 * 路由配置示例
 * 展示如何配置三种不同类型的路由
 */

/**
 * 示例1：公开路由配置
 * 这些路由不需要登录即可访问
 */
export const publicRoutesExample = [
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: {
      title: '关于我们',
      requiresAuth: false,  // ✅ 明确标记不需要登录
      icon: 'info-o'
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('@/views/help/index.vue'),
    meta: {
      title: '帮助中心',
      requiresAuth: false,  // ✅ 明确标记不需要登录
      icon: 'question-o'
    }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/terms/index.vue'),
    meta: {
      title: '服务条款',
      requiresAuth: false,  // ✅ 明确标记不需要登录
      hidden: true
    }
  }
]

/**
 * 示例2：登录路由配置
 * 这些路由需要登录，但不需要特定角色
 * 所有登录用户都可以访问
 */
export const authRoutesExample = [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true,  // ✅ 需要登录
      // ❌ 不设置 roles，表示所有登录用户都可以访问
      icon: 'user-circle-o'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: {
      title: '设置',
      requiresAuth: true,  // ✅ 需要登录
      icon: 'setting-o'
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/notifications/index.vue'),
    meta: {
      title: '通知',
      requiresAuth: true,  // ✅ 需要登录
      icon: 'bell-o'
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/favorites/index.vue'),
    meta: {
      title: '收藏',
      requiresAuth: true,  // ✅ 需要登录
      icon: 'star-o'
    }
  }
]

/**
 * 示例3：角色路由配置
 * 这些路由需要登录且需要特定角色
 */
export const roleRoutesExample = [
  // 管理员专属路由
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/dashboard.vue'),
    meta: {
      title: '管理后台',
      requiresAuth: true,  // 可省略，有 roles 时自动需要登录
      roles: ['admin'],    // ✅ 只有 admin 角色可以访问
      icon: 'dashboard-o'
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/users.vue'),
    meta: {
      title: '用户管理',
      roles: ['admin'],    // ✅ 只有 admin 角色可以访问
      icon: 'friends-o'
    }
  },
  
  // 多角色路由（管理员或编辑都可以访问）
  {
    path: '/content/manage',
    name: 'ContentManage',
    component: () => import('@/views/content/manage.vue'),
    meta: {
      title: '内容管理',
      roles: ['admin', 'editor'],  // ✅ admin 或 editor 角色可以访问
      icon: 'edit'
    }
  },
  
  // VIP 专属路由
  {
    path: '/vip/features',
    name: 'VipFeatures',
    component: () => import('@/views/vip/features.vue'),
    meta: {
      title: 'VIP功能',
      roles: ['vip', 'admin'],  // ✅ vip 或 admin 角色可以访问
      icon: 'diamond-o'
    }
  },
  
  // 超级管理员专属路由
  {
    path: '/system/config',
    name: 'SystemConfig',
    component: () => import('@/views/system/config.vue'),
    meta: {
      title: '系统配置',
      roles: ['super-admin'],  // ✅ 只有 super-admin 角色可以访问
      icon: 'setting-o'
    }
  }
]

/**
 * 示例4：嵌套路由配置
 * 展示父子路由的权限继承
 */
export const nestedRoutesExample = [
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('@/views/workspace/index.vue'),
    redirect: '/workspace/overview',
    meta: {
      title: '工作台',
      requiresAuth: true,  // 父路由需要登录
      icon: 'apps-o'
    },
    children: [
      {
        path: 'overview',
        name: 'WorkspaceOverview',
        component: () => import('@/views/workspace/overview.vue'),
        meta: {
          title: '概览',
          // 继承父路由的 requiresAuth
          // 所有登录用户都可以访问
        }
      },
      {
        path: 'projects',
        name: 'WorkspaceProjects',
        component: () => import('@/views/workspace/projects.vue'),
        meta: {
          title: '项目',
          // 继承父路由的 requiresAuth
          // 所有登录用户都可以访问
        }
      },
      {
        path: 'analytics',
        name: 'WorkspaceAnalytics',
        component: () => import('@/views/workspace/analytics.vue'),
        meta: {
          title: '数据分析',
          roles: ['admin', 'analyst'],  // 只有管理员和分析师可以访问
        }
      },
      {
        path: 'settings',
        name: 'WorkspaceSettings',
        component: () => import('@/views/workspace/settings.vue'),
        meta: {
          title: '工作台设置',
          roles: ['admin'],  // 只有管理员可以访问
        }
      }
    ]
  }
]

/**
 * 示例5：动态路由配置
 * 这些路由会根据用户角色动态添加
 */
export const asyncRoutesExample = [
  // 管理员路由组
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/index.vue'),
    redirect: '/admin/dashboard',
    meta: {
      title: '管理中心',
      roles: ['admin', 'super-admin'],
      icon: 'manager-o'
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard.vue'),
        meta: {
          title: '仪表盘',
          roles: ['admin', 'super-admin']
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users.vue'),
        meta: {
          title: '用户管理',
          roles: ['admin', 'super-admin']
        }
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/roles.vue'),
        meta: {
          title: '角色管理',
          roles: ['super-admin']  // 只有超级管理员可以管理角色
        }
      }
    ]
  },
  
  // 编辑路由组
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('@/views/editor/index.vue'),
    meta: {
      title: '编辑中心',
      roles: ['editor', 'admin'],
      icon: 'edit'
    },
    children: [
      {
        path: 'articles',
        name: 'EditorArticles',
        component: () => import('@/views/editor/articles.vue'),
        meta: {
          title: '文章管理',
          roles: ['editor', 'admin']
        }
      },
      {
        path: 'media',
        name: 'EditorMedia',
        component: () => import('@/views/editor/media.vue'),
        meta: {
          title: '媒体库',
          roles: ['editor', 'admin']
        }
      }
    ]
  }
]

/**
 * 示例6：错误处理路由
 * 这些路由用于处理各种错误情况
 */
export const errorRoutesExample = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      requiresAuth: false,  // 不需要登录
      hidden: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,  // 不需要登录
      hidden: true
    }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '服务器错误',
      requiresAuth: false,  // 不需要登录
      hidden: true
    }
  }
]

/**
 * 完整的路由配置示例
 */
export const completeRoutesExample = [
  // 1. 登录页（公开）
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
  
  // 2. 主布局
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/common/Layout.vue'),
    redirect: '/home',
    children: [
      // 2.1 公开页面
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
      
      // 2.2 需要登录的页面
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
      },
      
      // 2.3 需要特定角色的页面
      {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/views/admin/index.vue'),
        meta: {
          title: '管理',
          roles: ['admin'],
          icon: 'setting-o'
        }
      }
    ]
  },
  
  // 3. 错误页面
  ...errorRoutesExample,
  
  // 4. 404 重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true
    }
  }
]

/**
 * 使用说明：
 * 
 * 1. 在 router/routes.js 中导入需要的路由配置
 * 2. 根据实际需求选择合适的路由类型
 * 3. 确保每个路由都明确设置了 requiresAuth
 * 4. 需要角色控制的路由必须设置 roles 数组
 */
