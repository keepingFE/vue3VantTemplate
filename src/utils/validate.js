/**
 * 表单验证工具函数
 */

/**
 * 验证手机号
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

/**
 * 验证身份证号
 * @param {string} idCard
 * @returns {boolean}
 */
export function isValidIdCard(idCard) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 验证 URL
 * @param {string} url
 * @returns {boolean}
 */
export function isValidURL(url) {
  return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)
}

/**
 * 验证密码强度（至少包含数字和字母，长度6-20）
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password)
}

/**
 * 验证中文
 * @param {string} str
 * @returns {boolean}
 */
export function isValidChinese(str) {
  return /^[\u4e00-\u9fa5]+$/.test(str)
}

