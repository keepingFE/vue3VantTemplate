/**
 * 活动相关接口
 */
import request from '../request'

/**
 * 获取活动列表
 */
export const getActivityList = (params) => {
  return request({
    url: '/activity/list',
    method: 'get',
    params
  })
}

/**
 * 获取活动详情
 */
export const getActivityDetail = (id) => {
  return request({
    url: `/activity/detail/${id}`,
    method: 'get'
  })
}

/**
 * 报名参加活动
 */
export const joinActivity = (data) => {
  return request({
    url: '/activity/join',
    method: 'post',
    data
  })
}

/**
 * 获取我参加的活动列表
 */
export const getMyActivities = (params) => {
  return request({
    url: '/activity/my-activities',
    method: 'get',
    params
  })
}

/**
 * 取消报名
 */
export const cancelActivity = (id) => {
  return request({
    url: `/activity/cancel/${id}`,
    method: 'post'
  })
}
