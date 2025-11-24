# Mock 数据说明

本项目使用 [`vite-plugin-mock`](https://github.com/anncwb/vite-plugin-mock) + [`mockjs`](https://github.com/nuysoft/Mock/wiki) 模拟后端接口，帮助前端在无真实后端服务时完成开发与联调。本文档介绍 Mock 服务的启用方式、文件约定及已有接口。

## 1. 启用 Mock 服务

1. 在 `.env.development` 中将 `VITE_USE_MOCK` 设为 `true`（默认已开启）：  
   ```bash
   VITE_USE_MOCK=true
   ```
2. 重启开发服务器：`npm run dev`。  
3. 启动时 `vite.config.js` 会根据该变量注入 `vite-plugin-mock`，所有 `mock/` 目录下的文件会被自动加载并支持热更新，无需手动引入。

> 当 `VITE_USE_MOCK=false` 时，开发服务器会转发 `/api/*` 请求到真实后端（默认 `http://localhost:8080`）。

## 2. 目录结构与命名

```
mock/
├── user.js       # 用户相关接口
└── README.md     # 当前文档
```

- 推荐按照业务维度拆分文件，如 `auth.js`、`product.js`、`order.js` 等。
- 每个文件需 `export default []` 导出接口描述数组，`vite-plugin-mock` 会自动聚合。

## 3. 接口描述格式

```js
export default [
  {
    url: '/api/demo/list',        // 拦截的请求路径
    method: 'get',                // 请求方法（小写）
    timeout: 300,                 // 模拟网络延迟，单位 ms，可选
    response: ({ query, body, headers }) => {
      // 返回的数据结构建议统一为 { code, message, data }
      return {
        code: 200,
        message: 'success',
        data: []
      }
    }
  }
]
```

- `response` 参数中可解构 `body`（POST 数据）、`query`（URL 参数）、`headers`。
- 统一约定返回 `code`（业务状态码）、`message`（提示信息）、`data`（业务数据），方便前端统一处理。
- 需要生成随机数据时可使用 `Mock.Random`：  
  ```js
  import Mock from 'mockjs'
  const { Random } = Mock
  Random.name()
  Random.email()
  Random.datetime('yyyy-MM-dd HH:mm:ss')
  ```

## 4. 现有接口（`mock/user.js`）

| 接口 | 方法 | 描述 |
| ---- | ---- | ---- |
| `/api/user/login` | `POST` | 账号密码登录，返回 token 与用户信息 |
| `/api/user/info` | `GET` | 根据请求头 `Authorization` 返回当前用户详细信息 |
| `/api/user/logout` | `POST` | 模拟登出 |
| `/api/user/info` | `PUT` | 更新用户信息，返回提交数据及 `updateTime` |
| `/api/user/password` | `POST` | 校验旧密码并更新密码 |
| `/api/user/list` | `GET` | 支持 `page`/`pageSize`/`keyword` 的用户列表，使用 `Mock.Random` 生成数据 |

默认已内置两个账号：

| 用户名 | 密码 | 角色 |
| ------ | ---- | ---- |
| `admin` | `123456` | `admin` |
| `user` | `123456` | `user` |

## 5. 新增 Mock 模块流程

1. **创建文件**：在 `mock/` 下新建 `xxx.js`，导出接口数组。
2. **编写接口**：参照“接口描述格式”配置 `url`、`method`、`response` 等字段。
3. **重启/热更新**：Mock 文件保存后会自动热更新，如未生效可重启 `npm run dev`。
4. **前端调用**：与真实接口一致，使用 `/api` 前缀（对应 `VITE_APP_BASE_API`），无需额外适配。

## 6. 调试与排查

- 启动开发服务器后，终端会输出被 Mock 的请求日志，便于定位命中情况。
- 若请求未命中 Mock，请检查：
  - `VITE_USE_MOCK` 是否为 `true`；
  - 接口路径是否与实际请求一致（含前缀、大小写）；
  - 请求方法是否一致；
  - 是否遗漏了 `export default`。
- 可使用浏览器网络面板或 `curl` 验证：  
  ```bash
  curl -X POST http://localhost:3000/api/user/login ^
    -H "Content-Type: application/json" ^
    -d "{\"username\":\"admin\",\"password\":\"123456\"}"
  ```

按照以上约定维护 Mock 文件即可保证前端在缺少后端环境时也能完整体验业务流程。***
