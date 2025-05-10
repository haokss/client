import { jwtDecode } from 'jwt-decode';

export function getUserRole() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (err) {
    console.error('解码 token 失败:', err);
    return null;
  }
}

export function isAdmin() {
  return getUserRole() === 'admin';
}
