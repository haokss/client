// utils/encryption.js
import CryptoJS from 'crypto-js'

const AES_KEY = '1234567890abcdef' // 16 字节 key（128 位）
const AES_IV = '@isadufaisdfasdf' // 16 字节 IV

/**
 * AES 加密字段
 * @param {string|number} value - 需要加密的明文值
 * @returns {string} 加密后的字符串（Base64 格式）
 */
export function encryptField(value) {
  if (!value) return ''
  return CryptoJS.AES.encrypt(
    value.toString(),
    CryptoJS.enc.Utf8.parse(AES_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(AES_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString()
}

/**
 * AES 解密字段
 * @param {string} encrypted - 加密后的密文（Base64 格式）
 * @returns {string} 解密后的原文
 */
export function decryptField(encrypted) {
  if (!encrypted) return ''
  const decrypted = CryptoJS.AES.decrypt(
    encrypted,
    CryptoJS.enc.Utf8.parse(AES_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(AES_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}
