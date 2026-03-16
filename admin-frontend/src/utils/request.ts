import axios, { AxiosError } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/store/auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截：自动注入 JWT
request.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截：统一处理错误
request.interceptors.response.use(
  (response) => {
    const data = response.data
    // 后端统一返回 Result<T>，code !== 200 视为业务错误
    if (data.code !== undefined && data.code !== 200) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 失效，清除登录状态并跳转登录页
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    const msg = (error.response?.data as { message?: string })?.message
      || error.message
      || '网络错误'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default request
