/**
 * 路由配置
 */

/**
 * 基础路由（不需要权限）
 */
export const constantRoutes = [
  {
    path: '/redirect/:path(.*)',
    name: 'Redirect',
    component: () => import('@/views/redirect/index.vue'),
    meta: {
      title: '重定向',
      requiresAuth: false,
      hidden: true
    }
  },
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
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: {
      title: '注册',
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
        path: '/product',
        name: 'Product',
        component: () => import('@/views/product/index.vue'),
        meta: {
          title: '商品',
          requiresAuth: false,
          keepAlive: true,
          icon: 'shopping-cart-o'
        }
      },
      {
        path: '/product/detail/:id',
        name: 'ProductDetail',
        component: () => import('@/views/product/detail.vue'),
        meta: {
          title: '商品详情',
          requiresAuth: false,
          hidden: true
        }
      },

      {
        path: '/address/list',
        name: 'AddressList',
        component: () => import('@/views/address/index.vue'),
        meta: {
          title: '收货地址',
          requiresAuth: true,
          hidden: true
        }
      },
      {
        path: '/address/edit',
        name: 'AddressEdit',
        component: () => import('@/views/address/edit.vue'),
        meta: {
          title: '编辑地址',
          requiresAuth: true,
          hidden: true
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
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/cart/index.vue'),
    meta: {
      title: '购物车',
      requiresAuth: false,
      hidden: true
    }
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
    path: '/user/pdfPreview',
    name: 'PdfDemo',
    component: () => import('@/views/user/pdfPreview.vue'),
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
    path: '/upload/large-file',
    name: 'LargeFileUpload',
    component: () => import('@/views/upload/largeFileUpload.vue'),
    meta: {
      title: '大文件上传',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/waterfall',
    name: 'Waterfall',
    component: () => import('@/views/waterfall/index.vue'),
    meta: {
      title: '图片瀑布流',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/activity/list',
    name: 'ActivityList',
    component: () => import('@/views/activity/index.vue'),
    meta: {
      title: '活动列表',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/activity/detail/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/activity/detail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/activity/my-activities',
    name: 'MyActivities',
    component: () => import('@/views/activity/myActivities.vue'),
    meta: {
      title: '我参加的活动',
      requiresAuth: true,
      hidden: true
    }
  },
  {
    path: '/order/list',
    name: 'OrderList',
    component: () => import('@/views/order/index.vue'),
    meta: {
      title: '我的订单',
      requiresAuth: true,
      hidden: true
    }
  },
  {
    path: '/order/detail/:id',
    name: 'OrderDetail',
    component: () => import('@/views/order/detail.vue'),
    meta: {
      title: '订单详情',
      requiresAuth: true,
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
