/**
 * 商品相关 API
 */

import request from '../request'

export const productApi = {
  /**
   * 获取商品列表
   * @param {object} params - { page, pageSize, keyword, categoryId, status, sortBy, sortOrder }
   * @returns {Promise}
   */
  getList: (params) => request.get('/product/list', { params }),
  
  /**
   * 获取商品详情
   * @param {number} id - 商品ID
   * @returns {Promise}
   */
  getDetail: (id) => request.get(`/product/${id}`),
  
  /**
   * 获取商品分类
   * @returns {Promise}
   */
  getCategories: () => request.get('/product/categories'),
  
  /**
   * 获取热门商品
   * @param {object} params - { limit }
   * @returns {Promise}
   */
  getHot: (params) => request.get('/product/hot', { params }),
  
  /**
   * 获取推荐商品
   * @param {object} params - { limit }
   * @returns {Promise}
   */
  getRecommend: (params) => request.get('/product/recommend', { params }),
  
  /**
   * 搜索商品
   * @param {object} params - { keyword, page, pageSize }
   * @returns {Promise}
   */
  search: (params) => request.get('/product/search', { params }),
  
  /**
   * 添加商品
   * @param {object} data - 商品数据
   * @returns {Promise}
   */
  create: (data) => request.post('/product', data),
  
  /**
   * 更新商品
   * @param {number} id - 商品ID
   * @param {object} data - 商品数据
   * @returns {Promise}
   */
  update: (id, data) => request.put(`/product/${id}`, data),
  
  /**
   * 删除商品
   * @param {number} id - 商品ID
   * @returns {Promise}
   */
  delete: (id) => request.delete(`/product/${id}`)
}

