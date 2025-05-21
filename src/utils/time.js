import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
/**
 * 将日期和时间组合成 ISO8601 带时区偏移的字符串
 * @param {string|Date|dayjs.Dayjs} date - 日期部分，必填
 * @param {string|Date|dayjs.Dayjs} [time='00:00:00'] - 时间部分，选填，默认 00:00:00
 * @returns {string} 例如：2025-05-21T00:00:00+08:00
 */
export const formatLocalDateTime = (date, time = '00:00:00') => {
  const d = dayjs(date).toDate()
  const t = dayjs(`1970-01-01T${time}`).toDate() // 只取时间部分

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(t.getHours()).padStart(2, '0')
  const minutes = String(t.getMinutes()).padStart(2, '0')
  const seconds = String(t.getSeconds()).padStart(2, '0')

  const timezoneOffset = d.getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(timezoneOffset / 60)).toString().padStart(2, '0')
  const offsetMinutes = Math.abs(timezoneOffset % 60).toString().padStart(2, '0')
  const offsetSign = timezoneOffset > 0 ? '-' : '+'

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`
}

/**
 * 将 ISO8601 字符串格式的时间转换为本地时间，并格式化为 'YYYY-MM-DD'（到天）
 * @param {string} isoString - ISO8601 格式的时间字符串（如 '2025-05-21T10:00:00Z'）
 * @returns {string} 本地时间格式的字符串，例如 '2025-05-21'，如果输入为空则返回 '--'
 */
export const formatDate = (isoString) => {
  if (!isoString) return '--'
  return dayjs(isoString).format('YYYY-MM-DD')
}

/**
 * 将 ISO8601 字符串格式的时间转换为本地时间并格式化为 'YYYY-MM-DD HH:mm' 格式
 * @param {string} isoString - ISO8601 格式的时间字符串（如 '2025-05-21T10:00:00Z'）
 * @returns {string} 本地时间格式的字符串，例如 '2025-05-21 18:00'，如果输入为空则返回 '--'
 */
export const formatTime = (isoString) => {
  if (!isoString) return '--'
  // 将UTC时间转换为本地时间
  return dayjs(isoString).utc().local().format('YYYY-MM-DD HH:mm')
}