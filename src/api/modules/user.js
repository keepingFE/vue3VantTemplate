/**
 * 用户相关 API
 */

import request from '../request'

export const userApi = {
  /**
   * 登录
   * @param {object} data - { username, password }
   * @returns {Promise}
   */
  login: (data) => request.post('/user/login', data),
  
  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo: () => request.get('/user/info'),
  
  /**
   * 登出
   * @returns {Promise}
   */
  logout: () => request.post('/user/logout'),
  
  /**
   * 更新用户信息
   * @param {object} data
   * @returns {Promise}
   */
  updateUserInfo: (data) => request.put('/user/info', data),
  
  /**
   * 修改密码
   * @param {object} data - { oldPassword, newPassword }
   * @returns {Promise}
   */
  changePassword: (data) => request.post('/user/password', data),
  
  /**
   * 刷新 Token
   * @returns {Promise} - 返回新的 token
   */
  refreshToken: () => request.post('/user/refresh-token', {}, { loading: false })
}
