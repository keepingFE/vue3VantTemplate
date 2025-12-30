/**
 * 请求配置文件
 * 用于配置请求去重、超时、重试等行为
 */

export default {
  /**
   * 请求去重配置
   */
  deduplication: {
    // 是否启用全局请求去重
    enabled: true,
    
    // 是否显示重复请求提示
    showToast: true,
    
    // 去重策略：'all' | 'same-params' | 'same-url'
    // - 'all': 完整匹配（method + url + params + data）
    // - 'same-params': 仅匹配 method + url + params
    // - 'same-url': 仅匹配 method + url
    strategy: 'all',
    
    // 白名单：不进行去重的 URL 列表（支持正则表达式字符串）
    whitelist: [
      '/upload',
      '/download',
      '/export',
      '/import',
      '/log',
      '/track'
    ],
    
    // 黑名单：强制进行去重的 URL 列表（优先级高于白名单）
    blacklist: [],
    
    // 特殊请求类型自动跳过去重
    skipSpecialRequests: {
      formData: true,      // FormData 请求（文件上传）
      blob: true,          // Blob 响应（文件下载）
      arraybuffer: true    // ArrayBuffer 响应
    }
  },
  
  /**
   * 请求超时配置（毫秒）
   */
  timeout: {
    default: 15000,      // 默认超时时间
    upload: 300000,      // 上传超时时间（5分钟）
    download: 60000      // 下载超时时间（1分钟）
  },
  
  /**
   * Loading 配置
   */
  loading: {
    enabled: true,       // 是否显示 loading
    forbidClick: true,   // 是否禁止点击
    duration: 0          // 持续时间（0 表示手动关闭）
  },
  
  /**
   * Token 刷新配置
   */
  tokenRefresh: {
    enabled: true,              // 是否启用自动刷新
    advanceTime: 300,           // 提前刷新时间（秒），默认 5 分钟
    timeout: 30000,             // 刷新超时时间（毫秒）
    showToast: true             // 是否显示刷新提示
  }
}
