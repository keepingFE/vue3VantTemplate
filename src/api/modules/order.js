/**
 * 订单相关 API
 */

import request from '../request'

export const orderApi = {
  /**
   * 获取订单列表
   * @param {object} params - { page, pageSize, status, keyword }
   * @returns {Promise}
   */
  getList: (params) => request.get('/order/list', { params }),
  
  /**
   * 获取订单详情
   * @param {string} id - 订单ID或订单号
   * @returns {Promise}
   */
  getDetail: (id) => request.get(`/order/${id}`),
  
  /**
   * 创建订单
   * @param {object} data - 订单数据
   * @returns {Promise}
   */
  create: (data) => request.post('/order', data),
  
  /**
   * 支付订单
   * @param {string} id - 订单ID
   * @param {object} data - { paymentMethod }
   * @returns {Promise}
   */
  pay: (id, data) => request.post(`/order/${id}/pay`, data),
  
  /**
   * 取消订单
   * @param {string} id - 订单ID
   * @param {object} data - { reason }
   * @returns {Promise}
   */
  cancel: (id, data) => request.post(`/order/${id}/cancel`, data),
  
  /**
   * 确认收货
   * @param {string} id - 订单ID
   * @returns {Promise}
   */
  confirm: (id) => request.post(`/order/${id}/confirm`),
  
  /**
   * 申请退款
   * @param {string} id - 订单ID
   * @param {object} data - { reason, amount }
   * @returns {Promise}
   */
  refund: (id, data) => request.post(`/order/${id}/refund`, data),
  
  /**
   * 获取订单统计
   * @returns {Promise}
   */
  getStatistics: () => request.get('/order/statistics')
}

