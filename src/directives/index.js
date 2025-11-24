/**
 * 自定义指令入口
 */

import { permission } from './permission'
import { debounce } from './debounce'
import { throttle } from './throttle'

export default {
  install(app) {
    app.directive('permission', permission)
    app.directive('debounce', debounce)
    app.directive('throttle', throttle)
  }
}

